import requests
from bs4 import BeautifulSoup
import json
import re

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
    default_headers =  {
      "cookie": "terminalFinger=nCGFtFMtmTZikZ7zSKDgXm7gWyvTXPD7; rckk=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; _bee=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; ru1k=3711873d-e121-4d94-bbce-b674b8342c31; _f77=3711873d-e121-4d94-bbce-b674b8342c31; ru2k=ed8fd767-047c-49a2-ac80-acf20370863c; _a42=ed8fd767-047c-49a2-ac80-acf20370863c; api_uid=rBUUF2cCRJmX20rjOgO8Ag==; jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; _nano_fp=XpmqXp9jn0T8nqdonT_MOQjdfeT4ZrnuS3UZiMUe; webp=1; quick_entrance_click_record=20241108%2C479; request_id=8ee94dcdc9c144339a37d72ab5e1c7e2; PDDAccessToken=6YX7YRUMAGWZUPSSAUEB6I52WBPMRT3QNTUKW3QYIZT23CXXYVCQ120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaXLzyXIpicyWLrypOhapQvihQpLqLCLznTbvyXyXIfivaZyCbCoWnqGYQqP"

        # "cookie": 'api_uid=CkjpJmcCQXoqewBVtILWAg==; webp=1; PDDAccessToken=7PCZPZGXF32P7KV2JHZQQRM2WPE45UX4S6LSOYHHQ6VMZSJT2PFQ120e06b;'

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
            return {'status': 'error', 'message': f"Unexpected status code when accessing group7.html: {response.status_code}"}

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
raw_data = make_request("gzdhylOain")
print(raw_data)