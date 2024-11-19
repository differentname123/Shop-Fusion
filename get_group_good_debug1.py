# 读取 result.json
import json

with open('result.json', 'r', encoding='utf-8') as f:
    result = json.load(f)
goods_name_price_list = []
for item in result:
    # goods_name = item['goods_name']
    # goods_price = (item['min_group_price'] - item['coupon_discount']) / 100

    goods_name = item['skuName']
    goods_price = float(item['wlPrice'])
    if goods_price < 500 or '平板' not in goods_name:
        continue
    if goods_price < 500 or '小米' not in goods_name:
        continue

    goods_name_price = f"{goods_name}。价格:{goods_price}"
    if goods_name_price not in goods_name_price_list:
        goods_name_price_list.append(goods_name_price)

# 一行一行输出
for goods_name_price in goods_name_price_list:
    print(goods_name_price)