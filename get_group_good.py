import requests
from bs4 import BeautifulSoup
import json
import re


def get_group_good():
    """
    获取拼团小组的商品
    :return:
    """
    base_url = "https://mobile.pinduoduo.com/pincard_ask.html"

    # 默认参数，可以根据需要修改或替换
    default_params = {
        "__rp_name": "brand_amazing_price_group_team",
        "team_id": "4383",
    }

    headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8", "priority": "u=0, i",
        "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": "\"Windows\"", "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate", "sec-fetch-site": "same-origin", "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "terminalFinger=nCGFtFMtmTZikZ7zSKDgXm7gWyvTXPD7; rckk=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; _bee=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; ru1k=3711873d-e121-4d94-bbce-b674b8342c31; _f77=3711873d-e121-4d94-bbce-b674b8342c31; ru2k=ed8fd767-047c-49a2-ac80-acf20370863c; _a42=ed8fd767-047c-49a2-ac80-acf20370863c; api_uid=rBUUF2cCRJmX20rjOgO8Ag==; jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; _nano_fp=XpmqXp9jn0T8nqdonT_MOQjdfeT4ZrnuS3UZiMUe; webp=1; quick_entrance_click_record=20241108%2C479; request_id=8ee94dcdc9c144339a37d72ab5e1c7e2; PDDAccessToken=6YX7YRUMAGWZUPSSAUEB6I52WBPMRT3QNTUKW3QYIZT23CXXYVCQ120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaLSNXLkySQZbpQFIMoXbXnFtKbvQXnXGvakEktMiKGHiXykbpNVNZyVEkEV"


    }
    # 拼接参数为查询字符串
    response = requests.get(base_url, params=default_params, headers=headers)

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

    print(raw_data)


# 示例调用，可以传入新的参数
get_group_good()
