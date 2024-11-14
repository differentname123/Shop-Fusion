import json
import os

import requests
import time
import hashlib

"""
主要是进行商品名称的分析，然后选择出性价比最高的商品
"""

"""
请从商品描述中提取对应的重要关键信息，包括（品牌，包装类型，总重量，类别，单位，重量数量）。根据包装数量和单个重量计算总重量，并统一为数字形式。如果某些信息缺失或不明确，返回 '未知'。最后将信息以 JSON 格式返回。商品描述列表: ['可口可乐雪碧芬达多口味组合装500ml*18瓶汽水碳酸饮料夏季饮品', '天虹牌坚果520g淡盐味开心果袋装批发坚果干果颗粒健康零食小吃', '可口可乐1L*12瓶可乐/雪碧/芬达汽水碳酸饮料大瓶整箱装包邮', '无硫原色大颗粒开心果500克袋装无漂白盐焗味休闲零食坚果48g']
"""


import cohere

os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'
# 用你的 API 密钥进行初始化
api_key = 'DJye0RlJxutZRrlBLwetDT6Xpjdw3ziFjU2dmzQL'  # 替换为你的 Cohere API 密钥
cohere_client = cohere.Client(api_key)
def run():
    # 调用文本生成 API
    base_prompt = "请从商品描述中提取对应的重要关键信息，包括（品牌，包装类型，总重量，类别，单位，重量数量）。如果某些信息缺失或不明确，返回 '未知'。总重量信息要统一为数字形式，但如果描述中有多个重量且不确定哪个是总重量，返回 '未知'。最后将信息以 JSON 格式返回。"

    # 读取 temp.json 文件
    with open('temp.json', 'r', encoding='utf-8') as f:
        goods_list = json.load(f)
    goods_name_set = set()
    goods_name_list = []
    # 遍历 goods_list
    for item in goods_list:
        # 获取商品名称
        goods_name = item.get('goods_name', '')
        goods_name_set.add(goods_name)
        goods_name_list.append(goods_name)
        # 获取商品价格
        goods_price = item.get('min_group_price', 0)
    # 截取前 10 个商品描述
    goods_name_set = list(goods_name_list)[:10]
    other_prompts = "商品描述列表: " + str(list(goods_name_set))
    final_prompt = base_prompt + '\n' + "商品描述列表: ['可口可乐雪碧芬达多口味组合装500ml*18瓶汽水碳酸饮料夏季饮品', '天虹牌坚果520g淡盐味开心果袋装批发坚果干果颗粒健康零食小吃', '可口可乐1L*12瓶可乐/雪碧/芬达汽水碳酸饮料大瓶整箱装包邮', '无硫原色大颗粒开心果500克袋装无漂白盐焗味休闲零食坚果48g']"
    print(final_prompt)
    # 使用 Cohere 包发送请求


    response = cohere_client.generate(
        prompt=final_prompt,
        model='command-xlarge-nightly',  # 使用支持的模型名称
        max_tokens=6000
    )
    print(response.generations[0].text)
    print(response.generations[0].finish_reason)
    print(response.meta)



if __name__ == '__main__':
    run()