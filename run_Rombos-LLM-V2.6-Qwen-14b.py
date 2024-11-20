import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import os

# 设置代理（如果需要）
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

# 模型名称
model_name = "rombodawg/Rombos-LLM-V2.6-Qwen-14b"

# 加载分词器
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

# 使用8-bit量化提高精度和显存占用
quantization_config = BitsAndBytesConfig(
    load_in_8bit=True  # 使用8-bit量化
)

# 加载模型，使用8-bit量化
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=quantization_config,
    device_map="auto",  # 自动分配设备
    trust_remote_code=True
)

# 将模型设置为评估模式
model.eval()

# 定义 system message
system_message = "You are Qwen, a highly knowledgeable and helpful assistant created by Alibaba Cloud. Please respond in a professional and detailed manner."

# 对话循环
while True:
    # 获取用户输入
    user_input = input("You: ")
    # 退出对话的条件
    if user_input.lower() in ["exit", "quit", "bye"]:
        print("Goodbye!")
        break

    # 构建消息列表
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": user_input}
    ]

    # 使用聊天模板生成 prompt 文本
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    # 将生成的文本编码为模型输入
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

    # 生成回复
    with torch.no_grad():
        outputs = model.generate(
            **model_inputs,
            max_new_tokens=150,  # 增加生成长度
            do_sample=True,
            temperature=0.8,     # 提高生成的多样性
            top_k=100,           # 增加top_k
            top_p=0.85           # 减小top_p
        )

    # 提取生成的内容，去掉输入部分
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, outputs)
    ]

    # 解码生成的文本，并去掉特殊符号
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

    # 输出模型回复
    print(f"AI: {response}")