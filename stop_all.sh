#!/bin/bash

pkill -f 'vllm.entrypoints.openai.api_server'
pkill -f 'bge-large-zh-v1.5'
pkill -f 'uvicorn rag_sys.rag_server.rag_server:app'
pkill -f 'uvicorn infer_sys.quest_sys.quest_sys:app'
docker stop triton_server 2>/dev/null

echo "[ALL STOPPED] 所有服务已关闭"