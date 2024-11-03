import requests
import time
import hashlib

def generate_sign(params, client_secret):
    # 按照键排序
    sorted_params = sorted(params.items())
    # 拼接成字符串
    sign_str = client_secret + ''.join(f'{k}{v}' for k, v in sorted_params) + client_secret
    # MD5 加密并转成大写
    return hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()

client_id = 'f15639975cba4df6bc8afcde5151086a'
client_secret = '2b32a01a4d9ca5327595cf97eed3f798631c87f3'

# 构造请求参数
params = {
    'type': 'pdd.ddk.goods.pid.query',
    'client_id': client_id,
    'timestamp': int(time.time()),  # 使用 Unix 时间戳
    'data_type': 'JSON',
    'page': 1,         # 页码，从1开始
    'page_size': 10,   # 每页的 PID 数量
}

# 生成签名
params['sign'] = generate_sign(params, client_secret)

# 发送 POST 请求
url = 'https://gw-api.pinduoduo.com/api/router'
response = requests.post(url, data=params)

# 处理响应
if response.status_code == 200:
    print(response.json())  # 输出 JSON 响应
else:
    print("请求失败:", response.text)
