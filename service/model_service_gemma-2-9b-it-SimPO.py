# 安装必要的库
# pip install transformers torch accelerate flask

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import os
import time
from flask import Flask, request, jsonify

# 设置代理（如果需要）
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

# 指定模型名称
MODEL_NAME = "princeton-nlp/gemma-2-9b-it-SimPO"

# 加载分词器和模型
print("正在加载模型，请稍候...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,  # 使用半精度以节省显存
    device_map="auto"  # 自动分配到可用设备（如 GPU）
)
print("模型加载完成！")


# 定义一个生成函数
def generate_response(prompt, max_length=2000, temperature=0.7, top_p=0.9):
    """
    根据提示生成文本。
    :param prompt: 输入的提示文本
    :param max_length: 最大生成长度
    :param temperature: 控制生成的随机性
    :param top_p: nucleus sampling 的概率
    :return: 生成的文本
    """
    start_time = time.time()  # 开始计时

    # 将输入文本转为模型可处理的格式
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    # 模型生成
    outputs = model.generate(
        inputs["input_ids"],
        max_length=max_length,
        temperature=temperature,
        top_p=top_p,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )

    # 解码生成的文本
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # 计算推理时间
    elapsed_time = time.time() - start_time
    print(f"推理时间: {elapsed_time:.2f} 秒")

    return response, elapsed_time


# 创建 Flask 应用
app = Flask(__name__)


# 定义路由
@app.route('/generate', methods=['POST'])
def chat():
    """
    处理对话请求。接收 JSON 格式的输入，返回模型生成的回复。
    """
    try:
        # 从请求中获取输入内容
        data = request.json
        prompt = data.get("message", "")
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        # 调用生成函数
        response, elapsed_time = generate_response(prompt)
        print(prompt)
        print(response)
        # 返回生成的文本和推理时间
        return jsonify({
            "response": response,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 启动服务
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)