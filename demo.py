import requests
import time
import hashlib


# 生成签名函数
def generate_sign(params, client_secret):
    # 按照键排序
    sorted_params = sorted(params.items())
    # 拼接成字符串
    sign_str = client_secret + ''.join(f'{k}{v}' for k, v in sorted_params) + client_secret
    # MD5 加密并转成大写
    return hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()


# API 参数
client_id = 'f15639975cba4df6bc8afcde5151086a'
client_secret = '2b32a01a4d9ca5327595cf97eed3f798631c87f3'
pid = '41675195_295492064'  # 替换为查询结果中的有效 p_id
limit = 50
url = 'https://gw-api.pinduoduo.com/api/router'

# 初始化 list_id
list_id = 1

# 打开文件，准备写入商品名
with open('temp.txt', 'w', encoding='utf-8') as file:
    while True:
        if list_id > 200:
            break
        # 构造请求参数
        params = {
            'limit': limit,  # 返回数量
            'list_id': list_id,  # 商品 ID 列表，JSON 格式
            'type': 'pdd.ddk.goods.recommend.get',
            'client_id': client_id,
            'timestamp': int(time.time()),  # 使用 Unix 时间戳
            'data_type': 'JSON',
            "goods_sign": f"E9v2JRzishRgMvVRwuveDl7fPizfN8ah_JQP5CAY3h",  # 商品 ID 列表，JSON 格式
            'pid': pid,
            'custom_parameters': '{"source": "custom_value"}'  # 自定义参数
        }

        # 生成签名
        params['sign'] = generate_sign(params, client_secret)

        # 发送请求
        response = requests.post(url, data=params)

        # 处理响应
        if response.status_code == 200:
            try:
                # 获取商品列表
                goods_list = response.json()['goods_basic_detail_response']['list']

                # 如果商品列表为空，停止循环
                if not goods_list:
                    print("商品列表为空，结束查询。")
                    break

                # 将商品名写入文件
                for goods in goods_list:
                    goods_name = goods['goods_name']
                    file.write(f"{goods_name}\n")

                print(f"成功获取第 {list_id} 页的商品数据。")

                # 增加 list_id，继续获取下一页数据
                list_id += 1

                # 适当休眠以避免频繁请求
                time.sleep(1)

            except KeyError as e:
                print(f"解析响应时出错: {e}")
                break
        else:
            print("请求失败:", response.text)
            break