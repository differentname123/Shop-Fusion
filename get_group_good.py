import requests


def fetch_pinduoduo(params=None):
    base_url = "https://mobile.pinduoduo.com/pincard_ask.html"

    # 默认参数，可以根据需要修改或替换
    default_params = {
        "__rp_name": "brand_amazing_price_group_team",
        "_pdd_fs": "1",
        "team_id": "4372",
        "refer_page_name": "brand_amazing_price_group_channel",
        "refer_page_id": "128073_1731085689517_14db2f26g2",
        "refer_page_sn": "128073"
    }

    # 如果提供了新的参数，则合并更新
    if params:
        default_params.update(params)

    # 拼接参数为查询字符串
    response = requests.get(base_url, params=default_params, headers={
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "rec_list_brand_amazing_price_group_channel=rec_list_brand_amazing_price_group_channel_C2aTXK; rec_list_brand_amazing_price_group_team=rec_list_brand_amazing_price_group_team_jsUwrC; terminalFinger=nCGFtFMtmTZikZ7zSKDgXm7gWyvTXPD7; rckk=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; _bee=GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG; ru1k=3711873d-e121-4d94-bbce-b674b8342c31; _f77=3711873d-e121-4d94-bbce-b674b8342c31; ru2k=ed8fd767-047c-49a2-ac80-acf20370863c; _a42=ed8fd767-047c-49a2-ac80-acf20370863c; api_uid=rBUUF2cCRJmX20rjOgO8Ag==; jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; _nano_fp=XpmqXp9jn0T8nqdonT_MOQjdfeT4ZrnuS3UZiMUe; webp=1; quick_entrance_click_record=20241108%2C479; request_id=8ee94dcdc9c144339a37d72ab5e1c7e2; PDDAccessToken=SZGTH7UVTPDEKH5RC7ZNU6DQGOBMGNJ6OCRFCHWV6OUJDKYN5VXQ120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaLLNyLILPtoLNnINPLLoPEoONIyQOPGttQyEOymyQIbiaoaOmoOLttyaotO"

    })

    # 输出响应内容
    print(response.url)  # 打印拼接后的完整 URL
    print(response.text)  # 打印响应内容


# 示例调用，可以传入新的参数
fetch_pinduoduo({
})
