import time

import requests
import json
import execjs


def get_group_good_by_page():
    result_list = []
    # 读取和执行 JS 代码来获取 anti-content
    with open('pdd.js', encoding='utf-8') as file:
        js_code = file.read()
    ctx = execjs.compile(js_code)

    page_number = 1
    while True:
        at = ctx.call('antigain')
        # 构造请求体数据
        data = {
            "page_index": 1,
            "team_id": 1876,
            "page_size": 20,
            "grouping_radio_button_flag": 0,
            "isPostRisk": True,
            "anti_content": at,
        }

        url = "https://mobile.pinduoduo.com/proxy/api/api/brand-group/team/group_order_list?pdduid=4365968471&is_back=1"
        headers = {
            "Host": "mobile.pinduoduo.com",
            "Connection": "keep-alive",
            "Content-Length": "991",
            "sec-ch-ua-platform": "\"Windows\"",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
            "Content-Type": "application/json;charset=UTF-8",
            "sec-ch-ua-mobile": "?0",
            "Origin": "https://mobile.pinduoduo.com",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty",
            "Referer": "https://mobile.pinduoduo.com/pincard_ask.html?__rp_name=brand_amazing_price_group_team&_pdd_fs=1&team_id=1876&refer_page_name=brand_amazing_price_group_channel&refer_page_id=128073_1731332928287_cnrd6oz2a8&refer_page_sn=128073&page_id=129166_1731341759581_ipbc35q9sx&is_back=1",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Cookie": "rec_list_brand_amazing_price_group_team=rec_list_brand_amazing_price_group_team_Qi2upd; rec_list_brand_amazing_price_group_channel=rec_list_brand_amazing_price_group_channel_T13Us4; api_uid=Ck8IcWcyKZwsYwCeYnSiAg==; webp=1; jrpl=N0jPqgWvX5swTdy8lsFQnd1dpcaKXsqt; njrpl=N0jPqgWvX5swTdy8lsFQnd1dpcaKXsqt; dilx=9PMbaWaOsJCWTdnKxEoew; _nano_fp=XpmqXpXYX0moX5doXT_ct1IYCpvBeLhwXM9Y5uwm; PDDAccessToken=76XWD5BYUNIL3H6T26QKGLOOKGIFQGWS6R7XR6CVX3UHNSWZE2QA123576d; pdd_user_id=1279248863063; pdd_user_uin=ALCIJPHVL3KKOXFF4EG37L6YIQ_GEXDA; pdd_vds=gaLeNNLwPwPLLONILdQNOxGOixmmoILnmxamOwLNaGNsmxodomabbbOyPsbI"
        }

        # 发送 POST 请求
        response = requests.post(url, headers=headers, data=json.dumps(data))

        if response.status_code == 200:
            origin_result = response.json()
            print(origin_result)
            result = origin_result.get('result', {}) or {}
            group_order_list = result.get('group_order_list', [])
            if not group_order_list:
                print("No more goods found. Exiting loop.")
                break
            print(f"Page {page_number}: group_order_list size = {len(group_order_list)}")
            result_list.extend(group_order_list)

        # 增加页码继续搜索
        page_number += 1000
    return result_list


if __name__ == '__main__':
    print(get_group_good_by_page())
