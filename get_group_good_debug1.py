import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import os

# 配置代理（如果需要）
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

# 模型名称
model_name = "Qwen/Qwen2.5-14B-Instruct"

# 加载分词器，使用快速分词器以提高速度
tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)

# 加载模型，使用半精度（FP16）并将模型加载到 GPU
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map='auto'  # 自动将模型加载到可用的 GPU
)

# 将模型设置为评估模式
model.eval()

# 商品描述列表
descriptions = [
    '可口可乐雪碧芬达多口味组合装500ml*18瓶汽水碳酸饮料夏季饮品',
    '天虹牌坚果520g淡盐味开心果袋装批发坚果干果颗粒健康零食小吃',
    '无硫原色大颗粒开心果500克袋装无漂白盐焗味休闲零食坚果48g',
    '可口可乐1L*12瓶可乐/雪碧/芬达汽水碳酸饮料大瓶整箱装包邮',
    '炫迈无糖口香糖薄荷/西瓜味28片双盒装口气清新糖零食口香糖'
]

# 定义系统消息，用于设置模型的行为（精简版）
system_message = (
    "你是一个商品信息提取助手。请从商品描述中提取以下信息：\n"
    "- 品牌\n"
    "- 包装类型\n"
    "- 总容量/重量（数字，不带单位）\n"
    "- 类别\n"
    "- 单位（如 'g', 'kg', 'ml', 'L', '瓶', '包' 等）\n"
    "- 数量\n\n"
    "注意：\n"
    "1. 总容量/重量根据描述计算，如 '500g*2包' 计算为 1000。\n"
    "2. 如有多个重量或容量，选择最能代表商品的值。\n"
    "3. 如果信息缺失，返回 '未知'。\n"
    "4. 输出结果必须是 JSON 格式。\n"
)

# 将所有商品描述批量处理
full_prompts = []
for description in descriptions:
    # 拼接系统和用户消息
    user_message = f"商品描述：'{description}'"
    full_prompt = f"{system_message}\n{user_message}"
    full_prompts.append(full_prompt)

# 使用 tokenizer 对输入进行编码，限制最大长度以节省显存
inputs = tokenizer(full_prompts, return_tensors="pt", padding=True, truncation=True, max_length=512)

# 将输入移动到 GPU
inputs = inputs.to('cuda')

# 生成文本
with torch.no_grad():
    outputs = model.generate(
        inputs.input_ids,
        attention_mask=inputs.attention_mask,
        max_new_tokens=128,   # 根据需要调整
        num_beams=5,          # 使用 Beam Search 提高生成质量
        temperature=0.3,      # 降低温度，减少生成随机性
        early_stopping=True   # 提前停止生成
    )

# 解码生成结果
responses = tokenizer.batch_decode(outputs, skip_special_tokens=True)

# 打印结果
for description, response in zip(descriptions, responses):
    # 提取生成的回答部分，去除输入的提示部分
    extracted_response = response.split("商品描述：", 1)[-1].strip()
    extracted_response = extracted_response.replace(f"'{description}'", "").strip()
    print(f"商品描述: {description}")
    print(f"提取结果: {extracted_response}\n")