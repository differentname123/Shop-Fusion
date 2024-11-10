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
          "page_index": page_number,
          "team_id": '4383',
          "page_size": 20,
          "anti_content": at
        }

        url = "https://mobile.pinduoduo.com/proxy/api/api/brand-group/team/group_order_list?pdduid=4365968471"
        headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "content-type":"application/json;charset=UTF-8",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8", "priority": "u=0, i",
        "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": "\"Windows\"", "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate", "sec-fetch-site": "same-origin", "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "terminalFinger=nCGFtFMtmTZikZ7zSKDgXm7gWyvTXPD7; rckk=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; _bee=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; ru1k=3711873d-e121-4d94-bbce-b674b8342c31; _f77=3711873d-e121-4d94-bbce-b674b8342c31; ru2k=ed8fd767-047c-49a2-ac80-acf20370863c; _a42=ed8fd767-047c-49a2-ac80-acf20370863c; api_uid=rBUUF2cCRJmX20rjOgO8Ag==; jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; _nano_fp=XpmqXp9jn0T8nqdonT_MOQjdfeT4ZrnuS3UZiMUe; webp=1; quick_entrance_click_record=20241108%2C479; request_id=8ee94dcdc9c144339a37d72ab5e1c7e2; PDDAccessToken=6YX7YRUMAGWZUPSSAUEB6I52WBPMRT3QNTUKW3QYIZT23CXXYVCQ120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaLSNXLkySQZbpQFIMoXbXnFtKbvQXnXGvakEktMiKGHiXykbpNVNZyVEkEV"

    }

        # 发送 POST 请求
        response = requests.post(url, headers=headers, data=json.dumps(data))

        if response.status_code == 200:
            origin_result = response.json()
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