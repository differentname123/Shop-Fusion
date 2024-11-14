import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import os

# 设置代理环境变量
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

# 模型名称
model_name = "mistralai/Mistral-7B-v0.1"  # Hugging Face 上的 Mistral 7B 模型

# 加载分词器和模型
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto", torch_dtype=torch.float16, trust_remote_code=True)

# 检查是否有可用的 GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)  # 将模型移动到 GPU 或 CPU

# 定义 system_message
system_message = "You are an intelligent assistant that extracts key information from product descriptions and formats it as JSON."

# 定义商品描述和 Prompt 模板
descriptions = [
    '可口可乐雪碧芬达多口味组合装500ml*18瓶汽水碳酸饮料夏季饮品',
    '天虹牌坚果520g淡盐味开心果袋装批发坚果干果颗粒健康零食小吃',
    '可口可乐1L*12瓶可乐/雪碧/芬达汽水碳酸饮料大瓶整箱装包邮',
    '无硫原色大颗粒开心果500克袋装无漂白盐焗味休闲零食坚果48g'
]

# 定义 Prompt 模板
prompt_template = """
从以下商品描述中提取关键信息，并以 JSON 格式返回。信息包括：
- 品牌
- 包装类型
- 总重量（单位：克或毫升）
- 类别（如饮料、零食等）
- 单位（如 g, ml 等）
- 重量数量（如 500ml*18）

如果描述中缺少某些信息，请返回 "未知"。

商品描述: '{}'
"""

# 对话循环，处理每个商品描述
for description in descriptions:
    # 构建 messages 列表，包含 system_message 和 user_message
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": prompt_template.format(description)}
    ]

    # 将 messages 列表转换为模型输入文本
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

    # 对输入进行编码并将其移动到 GPU（如果有）
    inputs = tokenizer(prompt, return_tensors="pt").input_ids.to(device)

    # 使用模型生成输出
    with torch.no_grad():
        outputs = model.generate(inputs, max_length=512, num_beams=4, early_stopping=True)

    # 解码输出
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # 输出生成的结果
    print(f"商品描述: {description}\n提取结果:\n{result}\n")

    # 如果只想运行一次，可以在此处 break
    # break