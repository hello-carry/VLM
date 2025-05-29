import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import triton_python_backend_utils as pb_utils
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import numpy as np
import os

class TritonPythonModel:
    def initialize(self, args):
        # 日志：初始化开始
        print("[Triton] Initializing model...")
        # 设备选择
        device = "cuda" if args["model_instance_kind"] == "GPU" else "cpu"
        device_id = args["model_instance_device_id"]
        self.device = f"{device}:{device_id}"
        print(f"[Triton] Using device: {self.device}")

        # 模型路径，可通过环境变量指定
        model_path = os.getenv("MODEL_PATH", "/models/Qwen1.5-14B-Chat-GPTQ-Int4")
        print(f"[Triton] Loading model from: {model_path}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            device_map="auto",
            trust_remote_code=True
        )
        self.model.eval()
        print("[Triton] Model loaded and ready.")

    def execute(self, requests):
        responses = []
        for request in requests:
            input_tensor = pb_utils.get_input_tensor_by_name(request, "text_input")
            input_data = input_tensor.as_numpy()
            # 兼容 shape=[1,1] 或 shape=[1]
            input_text = input_data.flatten()[0].decode("utf-8")
            print(f"[Triton] Received input: {input_text}")

            # 推理
            inputs = self.tokenizer(input_text, return_tensors="pt").to(self.model.device)
            with torch.no_grad():
                output_ids = self.model.generate(
                    **inputs,
                    max_new_tokens=256,
                    do_sample=True,
                    top_p=0.95,
                    temperature=0.8
                )
            output_text = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
            print(f"[Triton] Output: {output_text}")

            # 修正：输出用utf-8编码为字节串，确保兼容中文
            out_tensor = pb_utils.Tensor("text_output", np.array([output_text.encode("utf-8")], dtype=np.bytes_))
            responses.append(pb_utils.InferenceResponse(output_tensors=[out_tensor]))
        return responses