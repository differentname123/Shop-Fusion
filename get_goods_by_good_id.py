import requests
import json
import execjs
"""
1.header至少要有：
    "anti-content": result,
    "content-type": "application/json;charset=UTF-8",
    "verifyauthtoken": "PnT7kGzS0hzqO1jpGpsVCg796a49c477f256e5f",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Cookie": "jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; api_uid=CiD86mczhjSJwgCx3OSOAg==; _nano_fp=XpmqXpTqX09qlpEbnC_aIbkdu7nypkxxahcU~SNQ; DDJB_PASS_ID=ea5e534e446a0c1a9963fdd947326e2b; DDJB_LOGIN_SCENE=0",
2.发送POST请求，主要data需不需要加json.dumps
"""


js_code = open('pdd.js', encoding='utf-8').read()
ctx = execjs.compile(js_code)
result = ctx.call('antigain')


url = "https://jinbao.pinduoduo.com/network/api/common/goodsList"
headers = {
    "anti-content": result,
    "content-type": "application/json;charset=UTF-8",
    "verifyauthtoken": "PnT7kGzS0hzqO1jpGpsVCg796a49c477f256e5f",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Cookie": "jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; api_uid=CiD86mczhjSJwgCx3OSOAg==; _nano_fp=XpmqXpTqX09qlpEbnC_aIbkdu7nypkxxahcU~SNQ; DDJB_PASS_ID=ea5e534e446a0c1a9963fdd947326e2b; DDJB_LOGIN_SCENE=0",

}


data = {
    "sectionId": 7,
    "sectionName": "数据线",
    "inBigSale": [],
    "keyword": "632069397380",
    "pageNumber": 1,
    "categoryId": -1,
    "pageSize": 60,
    "business": "single_promotion",
    "pageSn": 24548,
    "pageElSn": 777156
}



# 发送GET请求
response = requests.post(url, headers=headers, data=json.dumps(data))

print(response.text)
