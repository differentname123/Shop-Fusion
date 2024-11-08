import requests
import json
import execjs

url = "https://jinbao.pinduoduo.com/network/api/common/goodsList"
#
# with open('./res.js', 'r', encoding='utf-8') as file:
#     js_code = file.read()
#
# at = execjs.compile(js_code).call('getAntiContent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36')

js_code = open('pdd.js', encoding='utf-8').read()
ctx = execjs.compile(js_code)
at = ctx.call('antigain')

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

data = {"sectionId":10,"sectionName":"638612665748","inBigSale":[12546],"keyword":"638612665748","pageNumber":1,"categoryId":-1,"pageSize":60,"business":"single_promotion","pageSn":24548,"pageElSn":777156,"mallTypeList":None,"grayResultMap":1}


# 发送 POST 请求
response = requests.post(url, headers=headers, data=json.dumps(data))

# 处理响应
if response.status_code == 200:
    print(response.json())  # 输出商品信息的 JSON 数据
else:
    print("请求失败:", response.status_code, response.text)
