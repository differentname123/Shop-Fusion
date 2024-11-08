import time

import requests
import json
import execjs

def fetch_pdd_goods_list(keyword, target_page_sn):
    result_list = []
    # 读取和执行 JS 代码来获取 anti-content
    with open('pdd.js', encoding='utf-8') as file:
        js_code = file.read()
    ctx = execjs.compile(js_code)

    page_number = 1
    page_size = 60
    while True:
        # 构造请求体数据
        data = {
            "sectionId": 7,
            "sectionName": "数据线",
            "inBigSale": [],
            "keyword": keyword,
            "pageNumber": page_number,
            "categoryId": -1,
            "pageSize": page_size,
            "business": "single_promotion",
            "pageSn": target_page_sn,
            "pageElSn": 777156,
            "grayResultMap": 1,
            "listId": "cbabaf24b091ccb0304c73f2b39b497b"
        }

        at = ctx.call('antigain')

        url = "https://jinbao.pinduoduo.com/network/api/common/goodsList"
        headers = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "cookie": "terminalFinger=nCGFtFMtmTZikZ7zSKDgXm7gWyvTXPD7; rckk=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; _bee=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; ru1k=3711873d-e121-4d94-bbce-b674b8342c31; _f77=3711873d-e121-4d94-bbce-b674b8342c31; ru2k=ed8fd767-047c-49a2-ac80-acf20370863c; _a42=ed8fd767-047c-49a2-ac80-acf20370863c; api_uid=rBUUF2cCRJmX20rjOgO8Ag==; _nano_fp=Xpmxl0Pxlp98XpXJXC_K9YkdP2jW1MRDkmDzKLmK; jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; DDJB_PASS_ID=dce7f8f9d28f25d0f6651222b3d4567b; DDJB_LOGIN_SCENE=0",
            "anti-content": at,
            "content-type": "application/json;charset=UTF-8",
            "priority": "u=1, i",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "origin": "https://jinbao.pinduoduo.com",
            "verifyauthtoken": "7eua-kWOdj2buZuP-zfq1wdbcc91c49c980049e",
            "Referer": "https://jinbao.pinduoduo.com/promotion/single-promotion?keyword=610001443539",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
        }

        # 发送 POST 请求
        response = requests.post(url, headers=headers, data=json.dumps(data))

        if response.status_code == 200:
            origin_result = response.json()
            result = origin_result.get('result', {}) or {}
            goods_list = result.get('goodsList', [])
            print(f"Page {page_number}: goods_list size = {len(goods_list)}")
            # 延时 5 秒
            # time.sleep(1)
            if not goods_list:
                print("No more goods found. Exiting loop.%s" % origin_result)
                break

            # 检查是否包含目标 pageSn 值
            for item in goods_list:
                if 12546 in item['inBigSale'] and keyword in item['goodsDesc']:
                    result_list.append(item)

        else:
            print(f"请求失败: {response.status_code} {response.text}")
            break

        # 增加页码继续搜索
        page_number += 1
    print(result_list)
# 示例调用
fetch_pdd_goods_list("充电宝", 24548)
