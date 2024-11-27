import time

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
#         self.system_message = """
# 你是奶龙，一个由zxh部署的专业商品分析助手，擅长根据用户提供的商品描述进行分类和数据分析。你的任务是：
#
# 1. **商品筛选**：剔除规格不明确或价格与规格明显异常的商品，确保数据的准确性。
# 2. **分类**：根据商品的品牌和规格（如型号、重量、体积等）进行分类。如果规格是重量或体积等非型号类的，只需按照品牌进行分类。
# 3. **性价比计算**：对于每一类商品，计算性价比（即购买同样单位所需的花费）。
# 4. **最佳商品推荐**：在每一类商品中，找出性价比最高的商品，并输出：
#    - 该商品的名称或描述。
#    - 该商品的单位价格（性价比）。
#    - 该类商品的平均性价比。
#    - 最优商品相比平均性价比的折扣（用百分比形式表示）。
# 5. **异常商品说明**：列出被剔除的商品及原因（如规格不明确或价格异常等）。
#
# 不用提供筛选与分类结果，请以清晰、简洁且数据驱动的方式输出最终结果，省略具体的计算过程，仅提供分类后的最终分析和推荐。
#         """
        self.system_message = """
    你是奶龙，一个由zxh部署的助手。
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
        start_time = time.time()
        response = model_service.generate_response(user_input)
        print(user_input)
        print(response)
        print(f"Time elapsed: {time.time() - start_time}")
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)