import requests

url = "https://mobile.pinduoduo.com/pincard_ask.html"
params = {
    "__rp_name": "brand_amazing_price_group_team",
    "_pdd_fs": "1",
    "team_id": "4421",
    "refer_page_name": "login",
    "refer_page_id": "10169_1731429930807_ju235qo4wm",
    "refer_page_sn": "10169"
}

headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Priority": "u=0, i",
    "Sec-CH-UA": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "Referer": "https://mobile.pinduoduo.com/pincard_ask.html",
    "Cookie": "rec_list_brand_amazing_price_group_team=rec_list_brand_amazing_price_group_team_cHqKrw; jrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; njrpl=Zbe3yb5aP1SWnqEUoWFwP4tAoZbOw6yp; dilx=u9BaHD82A0av~TXmxkdC_; api_uid=CiD86mczhjSJwgCx3OSOAg==; PDDAccessToken=E7U7OD2BWINOGCANPK4TVBWLSPQ6YG7HUYWDP57RWGNZ2I6FKGHQ120570b; pdd_user_id=4365968471; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; pdd_vds=gaMxXnMbHmqsqbvxXshwHyqlYbDnfxXGqNftWxpsDtZOvbZlXmqIpGMmzxhO; webp=1; _nano_fp=XpmqXpTxlpU8XpEalT_Sl5vpkbteZdBVyYcpr7YS"
}

# If you need to include cookies or maintain a session
session = requests.Session()
session.headers.update(headers)

response = session.get(url, headers=headers, params=params)

# Check the response status
print(f"Status Code: {response.status_code}")

# Print the response content or handle it as needed
print(response.text)