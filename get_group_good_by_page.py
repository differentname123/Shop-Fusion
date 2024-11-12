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
            "team_id": 4421,
            "page_size": 20,
            "grouping_radio_button_flag": 0,
            "isPostRisk": True,
            "anti_content": at,
        }

        url = "https://mobile.pinduoduo.com/proxy/api/api/brand-group/team/group_order_list?pdduid=4365968471&is_back=1"
        headers = {
        "Host": "mobile.pinduoduo.com",
        "Connection": "keep-alive",
        "Cache-Control": "max-age=0",
        "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        "Referer": "https://mobile.pinduoduo.com/pincard_ask.html?__rp_name=brand_amazing_price_group_channel&_pdd_fs=1&_pdd_tc=ffffff&_pdd_sbs=1&refer_page_el_sn=7567298&refer_page_name=index&refer_page_id=10002_1731332905747_lydtoqg9rd&refer_page_sn=10002&page_id=128073_1731332928287_cnrd6oz2a8&is_back=1",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cookie": "terminalFinger=nCGFtFMtmTZikZ7zSKDgXm7gWyvTXPD7; rckk=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; _bee=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; ru1k=3711873d-e121-4d94-bbce-b674b8342c31; _f77=3711873d-e121-4d94-bbce-b674b8342c31; ru2k=ed8fd767-047c-49a2-ac80-acf20370863c; _a42=ed8fd767-047c-49a2-ac80-acf20370863c; api_uid=rBUUF2cCRJmX20rjOgO8Ag==; jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; _nano_fp=XpmqXp9jn0T8nqdonT_MOQjdfeT4ZrnuS3UZiMUe; webp=1; request_id=8ee94dcdc9c144339a37d72ab5e1c7e2; quick_entrance_click_record=20241112%2C479; pdd_vds=gaLlNGLnnsooIoitmotliOIwNnELnyGyQyNsnEyGOGibalOLEEEwosbOPLPI; PDDAccessToken=4WUWTDOMMT6ZA7EWEAFQNMTDJQKQPJFRPTSDMLPPWREYSOMBG4EA120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA"
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
