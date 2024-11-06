import execjs

with open('./res.js', 'r', encoding='utf-8') as file:
    js_code = file.read()

at = execjs.compile(js_code).call('getAntiContent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36')
print(at)