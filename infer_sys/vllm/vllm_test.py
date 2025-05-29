import requests
import json

url = "http://localhost:8000/v1/chat/completions"
headers = {"Content-Type": "application/json"}
data = {
    "model": "/srv/shared/models/Qwen1.5-14B-Chat-GPTQ-Int4",
    "messages": [
        {"role": "user", "content": "将进酒"}
    ],
    "stream": True
}

reply = ""
with requests.post(url, headers=headers, json=data, stream=True) as resp:
    for line in resp.iter_lines():
        if line:
            # vLLM流式返回每行前缀是data: ，需去掉
            if line.startswith(b"data: "):
                line = line[6:]
            # 跳过空行
            if not line.strip():
                continue
            # 跳过 [DONE] 行
            if line == b"[DONE]":
                continue
            # 解析json
            chunk = json.loads(line)
            delta = chunk["choices"][0]["delta"].get("content", "")
            print(delta, end="", flush=True)
            reply += delta
print("\n\n最终回复：", reply)