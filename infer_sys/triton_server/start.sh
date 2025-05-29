#!/bin/bash

# ========== 路径声明 ==========
MODEL_REPO="/home/cjh/survillience_llm/infer_sys/model_repo"
MODEL_WEIGHT="/srv/shared/models/Qwen1.5-14B-Chat-GPTQ-Int4"
TRITON_IMAGE="triton-python"
CONTAINER_MODEL_WEIGHT="/weights/Qwen1.5-14B-Chat-GPTQ-Int4"
TRITON_CONTAINER_NAME="triton_server"
DOCKER_NETWORK="tmp_network"

# ========== 创建自定义Docker网络（如不存在） ==========
if ! docker network inspect $DOCKER_NETWORK >/dev/null 2>&1; then
    echo "[INFO] Creating Docker network: $DOCKER_NETWORK"
    docker network create $DOCKER_NETWORK
fi

# ========== 启动Triton服务（后台运行） ==========
docker run -d --gpus all \
  --name $TRITON_CONTAINER_NAME \
  --network $DOCKER_NETWORK \
  -p 8000:8000 -p 8001:8001 -p 8002:8002 -p 9000:9000 \
  -v "$MODEL_REPO":/models \
  -v "$MODEL_WEIGHT":"$CONTAINER_MODEL_WEIGHT" \
  -e MODEL_PATH="$CONTAINER_MODEL_WEIGHT" \
  $TRITON_IMAGE \
  tritonserver --model-repository=/models

# ========== 等待 Triton 服务端口就绪（可选） ==========
# function wait_for_port() {
#     local host="$1"
#     local port="$2"
#     local timeout="$3"
#     local count=0
#     echo "[INFO] Waiting for $host:$port to become available..."
#     while ! nc -z $host $port >/dev/null 2>&1; do
#         sleep 1
#         count=$((count + 1))
#         if [ $count -gt $timeout ]; then
#             echo "[ERROR] Timeout waiting for $host:$port to open"
#             exit 1
#         fi
#     done
#     echo "[INFO] $host:$port is open."
# }
# wait_for_port localhost 8000 60

# ========== 输出提示 ==========
echo "[INFO] Triton server started as container: $TRITON_CONTAINER_NAME"
echo "[INFO] HTTP:    http://localhost:8000"
echo "[INFO] gRPC:    http://localhost:8001"
echo "[INFO] Metrics: http://localhost:8002"
echo "[INFO] (可选) OpenAI/自定义API: http://localhost:9000"