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
            "team_id": '1883',
            "page_size": 20,
            "anti_content": at
        }

        url = "https://mobile.pinduoduo.com/proxy/api/api/brand-group/team/group_order_list?pdduid=4365968471"
        headers = {
            "p-uno-context": "{\"immerse\":1,\"nh\":80.28571319580078,\"sh\":34.28571319580078,\"ls\":0,\"is-low-end\":0,\"ipv6-only\":0}",
            "X-PDD-QUERIES": "width=1080&height=2268&net=1&brand=Redmi&model=23013RK75C&osv=14&appv=7.33.0&pl=2",
            "ab-garden-home-js-split": "true",
            "User-Agent": "android Mozilla/5.0 (Linux; Android 14; 23013RK75C Build/UKQ1.230804.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/98.0.4758.101 Mobile Safari/537.36 MecoCore/502.8.1 MecoSDK/7  phh_android_version/7.33.0 phh_android_build/0ac80561d6fc247d5852c49907d3ae716bf1e519 phh_android_channel/xm pversion/0",
            "p-mode": "1",
            "ab-enable-split-require": "1",
            "fruit-spine-permanent-test": "true",
            "multi-set": "0,1,",
            "Host": "m.pinduoduo.net",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip",
            "Cookie": "rec_list_brand_amazing_price_group_channel=rec_list_brand_amazing_price_group_channel_3DxuCh; ETag=EABif1aQ; install_token=d6623dc4-7144-4df0-934c-87f6e82d4f4d; api_uid=Ck5cemVp3dSu2ABwHLrMAg; _nano_fp=XpmoXpTqn5CJl0Pbn9_lnZpJNbT45Po2ZE0B0DLl; dilx=c6Azs67TFfCM3HgUxg~0Z; jrpl=ZkYkeD8fwYrIvCIksZguN6L21SaLl4t3; njrpl=ZkYkeD8fwYrIvCIksZguN6L21SaLl4t3; pdd_user_id=4104180073528; pdd_user_uin=S4TXEOHRBOFZZFPGVQPWN4TNPQ_GEXDA; webp=1; X-CART-QUERIES=width%3D412%26height%3D915; tubetoken=uCJ%252FWaWGB9cgV752DzA96xckw8m19KXVmuhCTck6FjlRzMRXFqmzGaT0Gfp11wKZ2gv57cy0%252Brk0gfo7qM8hrIaMUvXdjOT%252Fdubjb0AxFnA107Oq0uJJXcFo9IEb686CgZp3kIw2Qd9um34VePbN5n0J3NdtvSlof0F0cWxic2kLS02qkWiKSYdIvWXs02L1%252B%252Fb158RGh0VdYUMegomLB1E%252B3O2awX%252BpTEJdAuKl%252FJ2m6ZYIUIt%252FBgF8wcJDPnGu; PDDAccessToken=D2ESPEEAKE34FHM3SVVEWTELQ3AIY4BTWCULVCSHAQDAEHO7W5WA12038c5; pdd_vds=gaLLNyLIQattEbbPooLiiQitiLGGLIiNGmLiLtbmILOOmNamiiiotLaNONLa"
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
