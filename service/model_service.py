from flask import Flask, request, jsonify
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import os

app = Flask(__name__)


class ModelService:
    def __init__(self):
        # 模型配置和加载
        os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
        os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

        model_name = "rombodawg/Rombos-LLM-V2.5-Qwen-32b"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            llm_int8_threshold=6.0,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=quantization_config,
            device_map="auto",
            trust_remote_code=True
        )
        self.model.eval()
        self.system_message = """
You are Qwen, a highly knowledgeable and helpful assistant created by Alibaba Cloud. Please respond in a professional and detailed manner.
        """

    def generate_response(self, user_input):
        messages = [
            {"role": "system", "content": self.system_message},
            {"role": "user", "content": user_input}
        ]
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.model.device)
        with torch.no_grad():
            outputs = self.model.generate(
                **model_inputs,
                max_new_tokens=1000,
                do_sample=True,
                temperature=0.7,
                top_k=50,
                top_p=0.9
            )
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, outputs)
        ]
        response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return response


# 初始化模型服务
model_service = ModelService()


@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    user_input = data.get("message", "")
    if not user_input:
        return jsonify({"error": "Invalid input"}), 400
    try:
        response = model_service.generate_response(user_input)
        print(user_input)
        print(response)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
