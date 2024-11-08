import requests
import time
import hashlib


# https://jinbao.pinduoduo.com/open.html?response_type=code&client_id=f15639975cba4df6bc8afcde5151086a&redirect_uri=https://eolavyj7304gqsk.m.pipedream.net&state=your_state
def generate_sign(params, client_secret):
    # 按照键排序
    sorted_params = sorted(params.items())
    # 拼接成字符串
    sign_str = client_secret + ''.join(f'{k}{v}' for k, v in sorted_params) + client_secret
    # MD5 加密并转成大写
    return hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()

client_id = 'f15639975cba4df6bc8afcde5151086a'
client_secret = '2b32a01a4d9ca5327595cf97eed3f798631c87f3'

# 使用查询到的 p_id
pid = '41675195_295492064'  # 替换为查询结果中的有效 p_id

# 构造 pdd.ddk.goods.search 请求参数
params = {
    'type': 'pdd.pop.auth.token.create',

    'client_id': client_id,
    'timestamp': int(time.time()),  # 使用 Unix 时间戳

    'code': "bff4bd0b55a04f5f984d3b5727bd151a44d3ca90",  # 使用 Unix 时间戳
    'end_time': "2024-11-01 00:00:00",  # 使用 Unix 时间戳

}

# 生成签名
params['sign'] = generate_sign(params, client_secret)

# 发送请求
url = 'https://gw-api.pinduoduo.com/api/router'
response = requests.post(url, data=params)

# 处理响应
if response.status_code == 200:
    print(response.json())  # 输出 JSON 响应
else:
    print("请求失败:", response.text)
