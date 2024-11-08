import requests
import json
import execjs
js_code = open('pdd.js',encoding='utf-8').read()
ctx = execjs.compile(js_code)
result = ctx.call('antigain')
url = "https://jinbao.pinduoduo.com/network/api/common/goodsList"
headers = {
  "accept": "application/json, text/plain, */*",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  "anti-content": result,
  "content-type": "application/json;charset=UTF-8",
  "origin": "https://jinbao.pinduoduo.com",
  "priority": "u=1, i",
  "referer": "https://jinbao.pinduoduo.com/promotion/single-promotion?keyword=610001443539",
  "sec-ch-ua-mobile": "?0",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
}

cookies={
    'terminalFinger': 'nCGFtFMtmTZikZ7zSKDgXm7gWyvTXPD7',
    'rckk': 'GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG',
    '_bee': 'GKW8IzbfsrXKLlqRJWlm1jMgF7QhpPsG',
    'ru1k': '3711873d-e121-4d94-bbce-b674b8342c31',
    '_f77': '3711873d-e121-4d94-bbce-b674b8342c31',
    'ru2k': 'ed8fd767-047c-49a2-ac80-acf20370863c',
    '_a42': 'ed8fd767-047c-49a2-ac80-acf20370863c',
    'api_uid': 'rBUUF2cCRJmX20rjOgO8Ag==',
    '_nano_fp': 'Xpmxl0Pxlp98XpXJXC_K9YkdP2jW1MRDkmDzKLmK',
    'jrpl': 'Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp',
    'njrpl': 'Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp',
    'dilx': 'u9BaHD82A0av~TXmxkdC_',
    'DDJB_PASS_ID': 'dce7f8f9d28f25d0f6651222b3d4567b',
    'DDJB_LOGIN_SCENE': '0'
}

data = {"sectionId":10,"sectionName":"610001443539","inBigSale":[],"keyword":"610001443539","pageNumber":1,"categoryId":-1,"pageSize":60,"business":"single_promotion","pageSn":24548,"pageElSn":777156}

data = json.dumps(data, separators=(',', ':'))

# 发送GET请求
response = requests.post(url, headers=headers, cookies=cookies, data=data)

print(response.text)