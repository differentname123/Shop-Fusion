import re
import json
from transformers import pipeline
import os

# 设置代理（如果需要）
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'
# 初始化 Hugging Face 的中文问答模型
qa_pipeline = pipeline("question-answering", model="timpal0l/mdeberta-v3-base-squad2")

# 问答函数，使用模型提取关键信息
def ask_question(question, context):
    try:
        result = qa_pipeline(question=question, context=context)
        return result["answer"] if result["score"] > 0.2 else "未知"  # score 阈值可以根据需要调整
    except Exception as e:
        return "未知"

# 解析商品描述的函数
def parse_product_description(description):
    # 定义要提取的关键信息
    info = {
        "品牌": ask_question("品牌是什么？", description),
        "包装类型": ask_question("包装类型是什么？", description),
        "总重量": "未知",  # 我们稍后计算总重量
        "类别": ask_question("类别是什么？", description),
        "单位": "ml" if "ml" in description else "g",  # 根据描述推测单位
        "重量数量": ask_question("重量是多少？", description),
        "包装数量": ask_question("包装数量是多少？", description)
    }

    # 使用正则表达式提取数量和重量信息以便计算总重量
    weight_match = re.search(r'(\d+\.?\d*)\s*(ml|g|L)', description)
    quantity_match = re.search(r'(\d+)\s*[瓶|袋|箱]', description)

    # 确定单位
    if weight_match:
        weight = float(weight_match.group(1))
        unit = weight_match.group(2)
        if unit == "L":  # 如果是升单位，转化为毫升
            weight *= 1000
        info["重量数量"] = f"{weight} ml" if unit in ["ml", "L"] else f"{weight} g"

    # 确定包装数量
    if quantity_match:
        quantity = int(quantity_match.group(1))
        info["包装数量"] = quantity

    # 计算总重量
    if weight_match and quantity_match:
        total_weight = weight * quantity
        info["总重量"] = total_weight

    return info

# 商品描述列表
product_descriptions = [
    '可口可乐雪碧芬达多口味组合装500ml*18瓶汽水碳酸饮料夏季饮品',
    '天虹牌坚果520g淡盐味开心果袋装批发坚果干果颗粒健康零食小吃',
    '可口可乐1L*12瓶可乐/雪碧/芬达汽水碳酸饮料大瓶整箱装包邮',
    '无硫原色大颗粒开心果500克袋装无漂白盐焗味休闲零食坚果48g'
]

# 解析每个商品描述
parsed_products = [parse_product_description(desc) for desc in product_descriptions]

# 将结果转换成 JSON 格式并打印
print(json.dumps(parsed_products, ensure_ascii=False, indent=4))