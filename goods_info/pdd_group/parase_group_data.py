import requests
from bs4 import BeautifulSoup
import json
import re

"""
最少使用cookie就能够启动
 {

        "Cookie": "rec_list_brand_amazing_price_group_team=rec_list_brand_amazing_price_group_team_Qi2upd; rec_list_brand_amazing_price_group_channel=rec_list_brand_amazing_price_group_channel_T13Us4; api_uid=Ck8IcWcyKZwsYwCeYnSiAg==; webp=1; jrpl=N0jPqgWvX5swTdy8lsFQnd1dpcaKXsqt; njrpl=N0jPqgWvX5swTdy8lsFQnd1dpcaKXsqt; dilx=9PMbaWaOsJCWTdnKxEoew; _nano_fp=XpmqXpXYX0moX5doXT_ct1IYCpvBeLhwXM9Y5uwm; PDDAccessToken=76XWD5BYUNIL3H6T26QKGLOOKGIFQGWS6R7XR6CVX3UHNSWZE2QA123576d; pdd_user_id=1279248863063; pdd_user_uin=ALCIJPHVL3KKOXFF4EG37L6YIQ_GEXDA; pdd_vds=gaLeNNLwPwPLLONILdQNOxGOixmmoILnmxamOwLNaGNsmxodomabbbOyPsbI"
    }
"""

def make_request(key_code, base_url="https://file-link.pinduoduo.com", headers=None):
    """
    发起请求并获取最终页面内容，包含重定向处理和异常捕获。

    参数：
    - key_code (str): 需要传递的参数，用于请求中的某个特定部分。
    - base_url (str): 基础 URL，可自定义。
    - headers (dict): 请求头信息，可以自定义覆盖默认值。

    返回：
    - dict: 包含提取到的 raw_data 或者错误信息。
    """
    # 构建初始请求 URL
    initial_url = f"{base_url}/{key_code}"
    print(initial_url)
    # 默认的请求头信息
    default_headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Priority": "u=0, i",
        "Sec-CH-UA": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": "\"Windows\"",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Referer": "https://mobile.pinduoduo.com/pincard_ask.html",
        "Cookie": "rec_list_brand_amazing_price_group=rec_list_brand_amazing_price_group_zegvsb; api_uid=CiTat2czkFhnmABXY9EyAg==; _nano_fp=XpmqXpTqX5dqnqEynC_nKWFwAQcz6bwPwodwgsMz; webp=1; jrpl=CALqopS1ixhpEb4GNdCDGcMTHkzskqOm; njrpl=CALqopS1ixhpEb4GNdCDGcMTHkzskqOm; dilx=Zg3Np6qOYb9i5y9tCHeyR; PDDAccessToken=Z6UQQO3UUKMOMI2TWMQX6ZJ7QN7MKFJLXJGTSZR4BRB6HVUZQXJQ120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaLLNyLamiLiIIPQOyaNOabLbGnLyyyoLaOIaQbImnoLtNaQGENmooEbinmQ"

    }

    # 合并自定义 headers
    if headers:
        default_headers.update(headers)

    try:
        # 1. 发起初始请求，获取重定向后的 URL
        response = requests.get(initial_url, headers=default_headers, allow_redirects=False)
        response.raise_for_status()
        # print(response.content)

        # 获取重定向的目标 URL
        if response.status_code in [301, 302, 307, 308]:
            redirected_url = response.headers.get('Location')
            if not redirected_url:
                return {'status': 'error', 'message': "Redirected URL not found in headers."}
        else:
            return {'status': 'error', 'message': f"Unexpected status code: {response.status_code}"}

        print(redirected_url)
        # 2. 访问重定向后的 URL
        response = requests.get(redirected_url, headers=default_headers, allow_redirects=False)
        response.raise_for_status()
        # print(response.content)

        # print("Request Information:")
        # print(f"Request URL: {response.request.url}")
        # print("Request Headers:", response.request.headers)
        # print("Response Information:")
        # print(f"Response Status: {response.status_code}")
        # print("Response Headers:", response.headers)
        # print("Response Text:", response.text)  # 打印响应内容

        # 3. 解析网页，找到最终 URL (可能是通过 JavaScript 跳转)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            script_tags = soup.find_all('script')

            # 查找包含 window.rawData 的 JavaScript
            final_url = None
            for script in script_tags:
                if 'location.replace' in script.text:
                    start_index = script.text.find("pincard_ask.html")
                    if start_index != -1:
                        end_index = script.text.find("'", start_index)
                        final_url = "https://mobile.yangkeduo.com/" + script.text[start_index:end_index]
                        break

            if not final_url:
                return {'status': 'error', 'message': "Final URL not found in JavaScript."}
        else:
            return {'status': 'error',
                    'message': f"Unexpected status code when accessing group7.html: {response.status_code}"}

        # 4. 访问最终的 `pincard_ask.html` 页面
        print(final_url)
        response = requests.get(final_url, headers=default_headers)
        # print(response.content)
        response.raise_for_status()

        # 5. 提取 window.rawData 数据
        soup = BeautifulSoup(response.text, 'html.parser')
        script_tags = soup.find_all('script')

        raw_data = None
        for script in script_tags:
            if script.string and 'window.rawData' in script.string:
                match = re.search(r'window\.rawData\s*=\s*({.*?});', script.string)
                if match:
                    raw_data_str = match.group(1)
                    try:
                        raw_data = json.loads(raw_data_str)
                    except json.JSONDecodeError:
                        return {'status': 'error', 'message': "JSON parsing failed."}
                break

        return {'status': 'success', 'data': raw_data}

    except requests.RequestException as e:
        return {'status': 'error', 'message': f"Request failed: {str(e)}"}
    except ValueError as e:
        return {'status': 'error', 'message': f"Error: {str(e)}"}


# 调用示例
raw_data = make_request("0nhSKPGrnf")
print(raw_data)
