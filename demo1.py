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

# 构造参数
params = {
    'type': 'pdd.ddk.goods.pid.generate',
    'client_id': client_id,
    'timestamp': int(time.time()),  # 使用 Unix 时间戳
    'data_type': 'JSON',
    'number': 1,  # 生成的 PID 数量
    'p_id_name_list': '["your_pid_name"]',  # 推广位名称列表，JSON 格式
    'media_id': '10124043440'  # 替换为你的媒体 ID
}

# 生成签名
params['sign'] = generate_sign(params, client_secret)

# 发送请求
url = 'https://gw-api.pinduoduo.com/api/router'
response = requests.post(url, data=params)

# 处理响应
if response.status_code == 200:
    print(response.json())
else:
    print("请求失败:", response.text)
