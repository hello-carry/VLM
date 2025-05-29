

python -m vllm.entrypoints.openai.api_server \
  --model /srv/shared/models/Qwen1.5-14B-Chat-GPTQ-Int4 \
  --quantization gptq \
  --dtype auto \
  --max-model-len 1024 \
  --max-num-batched-tokens 512 \
  --max-num-seqs 1 \
  --gpu-memory-utilization 0.5