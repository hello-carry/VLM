import os
import pandas as pd
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from typing import List
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility
import requests

# 初始化FastAPI
app = FastAPI()

# 连接Milvus
connections.connect("default", host="localhost", port="19530")

# 配置
COLLECTION_NAME = "event_knowledge"
EMBEDDING_DIM = 1024  
# EMBEDDER = SentenceTransformer("BAAI/bge-large-zh")

def get_embedding(texts):
    url = "http://localhost:8001/v1/embeddings"
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "/srv/shared/models/bge-large-zh-v1.5",
        "input": texts if isinstance(texts, list) else [texts]
    }
    resp = requests.post(url, headers=headers, json=data)
    resp.raise_for_status()
    return [item["embedding"] for item in resp.json()["data"]]

def create_collection_from_df(df):
    if COLLECTION_NAME in utility.list_collections():
        return
    fields = [
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=EMBEDDING_DIM)
    ]
    for col in df.columns:
        # 你可以根据实际情况调整max_length
        fields.append(FieldSchema(
            name=col,
            dtype=DataType.VARCHAR,
            max_length=256,
            is_primary=(col == df.columns[0]),  # 默认第一列为主键
            auto_id=False
        ))
    schema = CollectionSchema(fields, description="事件知识库")
    Collection(COLLECTION_NAME, schema)

@app.post("/upload_csv/")
async def upload_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    create_collection_from_df(df)
    collection = Collection(COLLECTION_NAME)
    # 拼接所有字段为文本用于embedding
    text_for_embedding = df.apply(lambda row: "；".join([f"{col}:{row[col]}" for col in df.columns]), axis=1)
    embeddings = get_embedding(text_for_embedding.tolist())
    # 组装插入数据，顺序必须和表结构一致
    data = [embeddings]  # embedding字段
    for col in df.columns:
        data.append(df[col].astype(str).tolist())
    collection.insert(data)
    collection.flush()
    collection.create_index(
        field_name="embedding",
        index_params={
            "index_type": "IVF_FLAT",
            "metric_type": "L2",
            "params": {"nlist": 128}
        }
    )
    return {"msg": f"成功入库{len(df)}条数据"}

# ========== 2. 检索接口 ==========
class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

@app.post("/search/")
def search(req: SearchRequest):
    collection = Collection(COLLECTION_NAME)
    collection.load()  # 加载到内存，确保可检索
    query_emb = get_embedding([req.query])
    search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
    output_fields = [field.name for field in collection.schema.fields if field.name != "embedding"]
    results = collection.search(
        data=query_emb,
        anns_field="embedding",
        param=search_params,
        limit=req.top_k,
        output_fields=output_fields
    )
    hits = []
    for hit in results[0]:
        hit_info = {field: hit.entity.get(field) for field in output_fields}
        hit_info["score"] = hit.distance
        hits.append(hit_info)
    return {"results": hits}

# ========== 3. 健康检查 ==========
@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.post("/drop_collection/")
def drop_collection():
    if Collection.exists(COLLECTION_NAME):
        Collection(COLLECTION_NAME).drop()
        return {"msg": f"Collection '{COLLECTION_NAME}' 已删除"}
    else:
        return {"msg": f"Collection '{COLLECTION_NAME}' 不存在"}