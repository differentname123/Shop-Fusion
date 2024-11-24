import json

import requests
import time
import hashlib

"""
通过api，不用调整代码
"""

def pdd_goods_search(page, page_size, keyword):
    def generate_sign(params, client_secret):
        sorted_params = sorted(params.items())
        sign_str = client_secret + ''.join(f'{k}{v}' for k, v in sorted_params) + client_secret
        return hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()

    client_id = 'f15639975cba4df6bc8afcde5151086a'
    client_secret = '2b32a01a4d9ca5327595cf97eed3f798631c87f3'
    pid = '41675195_295492064'

    params = {
        'type': 'pdd.ddk.goods.search',
        'client_id': client_id,
        'timestamp': int(time.time()),
        # 'goods_sign': keyword,
        'page': page,
        'page_size': page_size,
        'keyword': keyword,
        'pid': pid,
        'custom_parameters': '{"source": "custom_value"}'
    }

    params['sign'] = generate_sign(params, client_secret)
    url = 'https://gw-api.pinduoduo.com/api/router'
    response = requests.post(url, data=params)

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"请求失败: {response.text}"}

# 循环调用函数
page = 1
page_size = 60
keyword = "开心果"
result_list = []
while True:
    result = pdd_goods_search(page, page_size, keyword)

    if "error" in result:
        print(result["error"])
        break

    goods_list = result.get('goods_search_response', {}).get('goods_list', [])
    # 将 goods_list 保存到 temp.json 文件中
    with open('temp.json', 'w', encoding='utf-8') as f:
        json.dump(goods_list, f, ensure_ascii=False, indent=4)

    print(f"Page {page}: goods_list size = {len(goods_list)}")

    if not goods_list:
        print("No more goods found. Exiting loop.")
        break
    # 将 goods_list 转换为字符串
    goods_list_str = str(goods_list)
    for item in goods_list:
        if keyword in item['goods_desc']:
            result_list.append(item)

    page += 1
# print(result_list)

# 将 result_list 保存到 result.json 文件中
with open('result.json', 'w', encoding='utf-8') as f:
    json.dump(result_list, f, ensure_ascii=False, indent=4)