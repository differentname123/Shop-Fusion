import requests

# URL of the request
url = "https://m.pinduoduo.net/pincard_ask.html"

# Query parameters to be appended to the URL
params = {
    '__rp_name': 'brand_amazing_price_group_team',
    '_pdd_fs': '1',
    'team_id': '1876',
    'refer_page_name': 'brand_amazing_price_group_channel',
    'refer_page_id': '128073_1731311988994_by0vzix55n',
    'refer_page_sn': '128073'
}

# Headers for the request
headers = {
    "p-uno-context": '{"immerse":1,"nh":80.28571319580078,"sh":34.28571319580078,"ls":0,"is-low-end":0,"ipv6-only":0}',
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
    "Cookie": "rec_list_brand_amazing_price_group_team=rec_list_brand_amazing_price_group_team_0pzaSj; rec_list_brand_amazing_price_group_channel=rec_list_brand_amazing_price_group_channel_CQPmZ7; api_uid=CkqcKWcxjMITogCYXbPTAg; pdd_user_id=4365968471; ETag=EABif1aQ; pdd_user_uin=X4SHUDVGMG7HGQBVER6XRAMGHI_GEXDA; install_token=daaeffe9-4a57-49ab-afe5-d583771dd6a1; webp=1; _nano_fp=XpmqXpXoXpTJX0TYnT_T7FVGfjnaW8NyNf~L1Mgl; PDDAccessToken=VKH4BZUO4LR6UYLPLYE6IHGN5S2HOLFLPY5R7I4R2IWQI2I6MFMQ120570b; pdd_vds=gawfLlwdaLLeQftNEnweQeawQsolnuaNQNifIximNTGDnfiLOdwdnbQfwunD"
}

# Sending the GET request
response = requests.get(url, headers=headers, params=params)

# Check if the request was successful
if response.status_code == 200:
    print("Response received successfully!")
    print(response.text)  # Print the response content
else:
    print(f"Failed to receive response. Status code: {response.status_code}")