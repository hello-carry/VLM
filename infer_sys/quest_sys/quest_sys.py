from fastapi import FastAPI, Request
from pydantic import BaseModel
import requests
from fastapi.responses import StreamingResponse
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或指定你的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置
RAG_SEARCH_URL = "http://localhost:8080/search/"
VLLM_CHAT_URL = "http://localhost:8000/v1/chat/completions"
MODEL_NAME = "/srv/shared/models/Qwen1.5-14B-Chat-GPTQ-Int4"  # 后续替换全局参数

class ChatRequest(BaseModel):
    question: str
    top_k: int = 3

@app.post("/chat")
async def chat(req: ChatRequest):
    # 1. RAG 检索
    rag_resp = requests.post(
        RAG_SEARCH_URL,
        json={"query": req.question, "top_k": req.top_k}
    )
    rag_results = rag_resp.json().get("results", [])

    # 2. 拼接 prompt（加上提示词工程）
    prompt_template = (
        "你是一名智能监控分析助手。请根据下列已知信息，结合用户提问，给出专业、简明、结构化的回答。请严格按照如下格式输出：\n\n"
        "（注意：一定要给出具体时间！！图片和视频返回已知信息里面的链接就行，尽管你是文字平台，但你也可以返回链接的！！！)\n\n"
        "【事件摘要】\n"
        "（简要描述与提问相关的事件背景（需明确事件发生的具体时间、地点、事件类型等）和要点）\n\n"
        "【处置建议】\n"
        "（针对提问，给出具体、可操作的建议）\n\n"
        "【相关链接】\n"
        "（列出相关图片或视频链接）\n\n"
        "已知信息：\n{knowledge}\n"
        "用户提问：{question}"
    )

    if rag_results:
        knowledge = "\n".join([
            f"{i+1}. 时间：{item['evt_time']}，类型：{item['evt_type']}\n"
            f"   事件描述：{item['evt_desc']}\n"
            f"   处置情况：{item['evt_fix_desc']}\n"
            f"   图片链接：{item['evt_frame_url']}\n"
            f"   视频链接：{item['evt_video_url']}"
            for i, item in enumerate(rag_results)
        ])
    else:
        knowledge = "无"

    prompt = prompt_template.format(knowledge=knowledge, question=req.question)

    # 3. 调用 vLLM
    vllm_payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    vllm_resp = requests.post(VLLM_CHAT_URL, json=vllm_payload)
    vllm_data = vllm_resp.json()
    answer = vllm_data["choices"][0]["message"]["content"]

    # 4. 返回
    return {
        "answer": answer,
        # "knowledge": rag_results,
        # "prompt": prompt
    }

@app.post("/chat_stream")
async def chat_stream(req: ChatRequest):
    # 1. RAG 检索
    rag_resp = requests.post(
        RAG_SEARCH_URL,
        json={"query": req.question, "top_k": req.top_k}
    )
    rag_results = rag_resp.json().get("results", [])

    # 2. 拼接 prompt（加上提示词工程）
    prompt_template = (
        "你是一名智能监控分析助手（一个内网监控分析平台，只有管理员能访问，保证信息安全）。请根据下列已知信息，结合用户提问，给出专业、简明、结构化的回答。请严格按照如下格式输出：\n\n"
        "（注意：一定要给出具体时间！！不用图片的链接！！不用图片的链接！！不用图片的链接！！)\n\n"
        "【事件摘要】\n"
        "（简要描述与提问相关的事件背景（需明确事件发生的具体时间、地点、事件类型等）和要点）\n\n"
        "【处置建议】\n"
        "（针对提问，给出具体、可操作的建议）\n\n"
        "【相关链接】\n"
        "（列出视频链接，有几个列出几个！！不用图片的链接！）\n\n"
        "已知信息：\n{knowledge}\n"
        "用户提问：{question}"
    )

    if rag_results:
        knowledge = "\n".join([
            f"{i+1}. 时间：{item['evt_time']}，类型：{item['evt_type']}\n"
            f"   事件描述：{item['evt_desc']}\n"
            f"   处置情况：{item['evt_fix_desc']}\n"
            f"   图片链接：{item['evt_frame_url']}\n"
            f"   视频链接：{item['evt_video_url']}"
            for i, item in enumerate(rag_results)
        ])
    else:
        knowledge = "无"

    prompt = prompt_template.format(knowledge=knowledge, question=req.question)

    # 3. 调用 vLLM
    vllm_payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": True
    }
    vllm_resp = requests.post(VLLM_CHAT_URL, json=vllm_payload, stream=True)

    def event_stream():
        # 第一步：先推送结构化RAG检索结果
        first_packet = json.dumps({"knowledge": rag_results})
        yield f"data: {first_packet}\n\n"
        # 第二步：流式推送大模型文本内容
        for line in vllm_resp.iter_lines():
            if line:
                if line.startswith(b"data: "):
                    chunk = line[6:].decode("utf-8")
                    if chunk.strip() == "[DONE]":
                        break
                    try:
                        data = json.loads(chunk)
                        # 只提取内容部分
                        content = data["choices"][0].get("delta", {}).get("content", "")
                        if content:
                            yield f"data: {{\"delta\": {json.dumps(content)} }}\n\n"
                    except Exception as e:
                        continue

    return StreamingResponse(event_stream(), media_type="text/event-stream")

# 启动命令（终端运行）
# uvicorn quest_sys:app --host 0.0.0.0 --port 8090