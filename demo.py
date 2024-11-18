import requests
import time
import hashlib


# 生成签名函数
def generate_sign(params, client_secret):
    # 按照键排序
    sorted_params = sorted(params.items())
    # 拼接成字符串
    sign_str = client_secret + ''.join(f'{k}{v}' for k, v in sorted_params) + client_secret
    # MD5 加密并转成大写
    return hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()


# 读取 used_goodsname.txt 中的商品名
def load_used_goods_names(file_path):
    goods_name_set = set()
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                goods_name = line.strip()  # 去掉换行符
                if goods_name:  # 确保不是空行
                    goods_name_set.add(goods_name)
    except FileNotFoundError:
        print(f"文件 {file_path} 不存在，继续执行。")
    return goods_name_set


# API 参数
client_id = 'f15639975cba4df6bc8afcde5151086a'
client_secret = '2b32a01a4d9ca5327595cf97eed3f798631c87f3'
pid = '41675195_295492064'  # 替换为查询结果中的有效 p_id
limit = 50
url = 'https://gw-api.pinduoduo.com/api/router'

# 分类和渠道类型
cat_ids = {
    20100: '百货', 20200: '母婴', 20300: '食品', 20400: '女装', 20500: '电器',
    20600: '鞋包', 20700: '内衣', 20800: '美妆', 20900: '男装', 21000: '水果',
    21100: '家纺', 21200: '文具', 21300: '运动', 21400: '虚拟', 21500: '汽车',
    21600: '家装', 21700: '家具', 21800: '医药'
}

channel_types = {
    1: '今日销量榜', 3: '相似商品推荐', 4: '猜你喜欢', 5: '实时热销榜', 6: '实时收益榜'
}

# 初始化 list_id
list_id = 1

# 加载 used_goodsname.txt 中的商品名，避免重复写入
used_goodsname_file = 'used_goodsname.txt'
goods_name_set = load_used_goods_names(used_goodsname_file)

# 打开文件，准备写入去重后的商品名
with open('temp.txt', 'w', encoding='utf-8') as file:
    # 遍历 cat_id 和 channel_type 的所有组合
    for cat_id, cat_name in cat_ids.items():
        for channel_type, channel_name in channel_types.items():
            print(
                f"正在获取分类 {cat_name} (cat_id={cat_id}) 和频道 {channel_name} (channel_type={channel_type}) 的数据")

            # 重置 list_id 每次从 1 开始
            list_id = 1

            while True:
                if list_id > 100:
                    break

                # 构造请求参数
                params = {
                    'cat_id': cat_id,  # 商品类目 ID
                    'page_size': limit,  # 返回数量
                    'page': list_id,  # 商品 ID 列表，JSON 格式
                    'type': 'pdd.ddk.goods.search',
                    'client_id': client_id,
                    'timestamp': int(time.time()),  # 使用 Unix 时间戳
                    'data_type': 'JSON',
                    'pid': pid,
                    'custom_parameters': '{"source": "custom_value"}'  # 自定义参数
                }

                # 生成签名
                params['sign'] = generate_sign(params, client_secret)

                # 发送请求
                response = requests.post(url, data=params)

                # 处理响应
                if response.status_code == 200:
                    try:
                        # 获取商品列表
                        goods_list = response.json().get('goods_search_response', {}).get('goods_list', [])

                        # 如果商品列表为空，停止循环
                        if not goods_list:
                            print(
                                f"商品列表为空，结束 {cat_name} (cat_id={cat_id}) 和 {channel_name} (channel_type={channel_type}) 的查询。")
                            break

                        # 将商品名写入文件，同时去重
                        for goods in goods_list:
                            goods_name = goods['goods_name']
                            if goods_name not in goods_name_set:
                                # 如果商品名不在集合中，则写入文件并添加到集合
                                file.write(f"{goods_name}\n")
                                goods_name_set.add(goods_name)

                        print(f"成功获取第 {list_id} 页的商品数据。")

                        # 增加 list_id，继续获取下一页数据
                        list_id += 1

                        # 适当休眠以避免频繁请求
                        time.sleep(1)

                    except KeyError as e:
                        print(f"解析响应时出错: {e}")
                        break
                else:
                    print(f"请求失败: {response.text}")
                    break