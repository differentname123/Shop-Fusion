import requests
from bs4 import BeautifulSoup
import json
import re

"""
最少
    default_params = {
        "__rp_name": "brand_amazing_price_group_team",
        "team_id": "4404",
    }
    
    和
    {
        "Cookie": "rec_list_brand_amazing_price_group_channel=rec_list_brand_amazing_price_group_channel_C12kNS; rec_list_brand_amazing_price_group_team=rec_list_brand_amazing_price_group_team_a65E9l; terminalFinger=nCGFtFMtmTZikZ7zSKDgXm7gWyvTXPD7; rckk=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; _bee=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; ru1k=3711873d-e121-4d94-bbce-b674b8342c31; _f77=3711873d-e121-4d94-bbce-b674b8342c31; ru2k=ed8fd767-047c-49a2-ac80-acf20370863c; _a42=ed8fd767-047c-49a2-ac80-acf20370863c; api_uid=rBUUF2cCRJmX20rjOgO8Ag==; jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; _nano_fp=XpmqXp9jn0T8nqdonT_MOQjdfeT4ZrnuS3UZiMUe; webp=1; request_id=8ee94dcdc9c144339a37d72ab5e1c7e2; quick_entrance_click_record=20241111%2C479; PDDAccessToken=EBFCQNKW5K6BGWGG6QFM5BGKIAD4X33SXBDDYJEVSEJ6KMLNA3LQ120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaULRyUIHGXPVESiVokGJLHGjOAyUIFQSbWiHiSQMbzNAIUQMLALXQKoJnRQ"
    }
    就能访问
"""


def get_group_good():
    """
    获取拼团小组的商品
    :return:
    """
    base_url = "https://mobile.pinduoduo.com/pincard_ask.html"

    # 默认参数，可以根据需要修改或替换
    default_params = {
        "__rp_name": "brand_amazing_price_group_team",
        "_pdd_fs": "1",
        "team_id": "1798",
        "refer_page_name": "login",
        "refer_page_id": "10169_1731429930807_ju235qo4wm",
        "refer_page_sn": "10169"
    }
    headers = {
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
    # 把headers变成字典并打印
    # print(dict(headers))

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
