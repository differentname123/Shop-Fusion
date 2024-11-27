import hashlib
import time
import requests


def generate_promotion_urls(goods_sign_list, client_id, client_secret, pid):
    """
    根据输入的 goods_sign_list 调用拼多多 API，生成推广链接。

    :param goods_sign_list: 商品的 goods_sign 列表 (JSON 格式字符串)
    :return: API 响应结果 (JSON 格式)
    """

    def generate_sign(params, client_secret):
        """
        生成签名
        :param params: 请求参数 (字典)
        :param client_secret: 客户端密钥
        :return: 签名字符串
        """
        sorted_params = sorted(params.items())
        sign_str = client_secret + ''.join(f'{k}{v}' for k, v in sorted_params) + client_secret
        return hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()

    url = 'https://gw-api.pinduoduo.com/api/router'  # 拼多多 API 的 URL
    # 请求参数
    params = {
        'type': 'pdd.ddk.goods.promotion.url.generate',
        'client_id': client_id,
        'timestamp': int(time.time()),
        'p_id': pid,
        'custom_parameters': '{"source": "custom_value"}',
        'goods_sign_list': goods_sign_list,
        'generate_we_app': 'true',
    }

    # 生成签名
    params['sign'] = generate_sign(params, client_secret)

    # 发起请求
    response = requests.post(url, data=params)

    # 返回响应结果
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"请求失败: {response.text}"}