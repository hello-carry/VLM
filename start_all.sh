#!/bin/bash

set -e

LOGDIR="logs"
mkdir -p $LOGDIR

# 1. 启动 vLLM Qwen
nohup bash infer_sys/vllm/start.sh > $LOGDIR/vllm_qwen.log 2>&1 &
echo "[OK] vLLM Qwen 启动中..."
sleep 60  # 等待Qwen模型加载
echo "[OK] vLLM Qwen 启动完成"

# 2. 启动 embedding server
nohup bash rag_sys/rag_server/ebd_model_start.sh > $LOGDIR/embedding_server.log 2>&1 &
echo "[OK] Embedding Server 启动中..."
sleep 30
echo "[OK] Embedding Server 启动完成"

# 3. 启动 RAG Server
nohup uvicorn rag_sys.rag_server.rag_server:app --host 0.0.0.0 --port 8080 > $LOGDIR/rag_server.log 2>&1 &
echo "[OK] RAG Server 启动完成"

# 4. 启动 Quest Sys（RAG推理服务）
nohup uvicorn infer_sys.quest_sys.quest_sys:app --host 0.0.0.0 --port 8090 > $LOGDIR/quest_sys.log 2>&1 &
echo "[OK] Quest Sys 启动完成"


echo "\n[ALL DONE] 所有服务已启动，日志见 $LOGDIR/" 