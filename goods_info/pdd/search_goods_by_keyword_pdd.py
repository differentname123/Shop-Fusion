import json
import requests
import time
import hashlib
import logging

from goods_info.common_utils import get_config

# 日志配置
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# 增量日志文件配置
log_file_handler = logging.FileHandler('search_log.json', mode='a', encoding='utf-8')
log_file_handler.setFormatter(logging.Formatter('%(message)s'))
log_file_handler.setLevel(logging.INFO)
incremental_logger = logging.getLogger("incremental")
incremental_logger.addHandler(log_file_handler)
incremental_logger.propagate = False  # 防止重复记录日志


def generate_sign(params, client_secret):
    """
    生成签名
    :param params: 请求参数 (字典)
    :param client_secret: 客户端密钥
    :return: 签名字符串
    """
    sorted_params = sorted(params.items())
    sign_str = client_secret + ''.join(f'{k}{v}' for k, v in sorted_params) + client_secret
    sign = hashlib.md5(sign_str.encode('utf-8')).hexdigest().upper()
    logger.debug(f"生成签名: {sign}")
    return sign


def pdd_goods_search(page, page_size, keyword, client_id, client_secret, pid):
    """
    调用拼多多 API 搜索商品
    :param page: 当前页码
    :param page_size: 每页商品数量
    :param keyword: 搜索关键字
    :param client_id: 拼多多 API 的 Client ID
    :param client_secret: 拼多多 API 的 Client Secret
    :param pid: 推广位 ID
    :return: API 响应结果 (JSON 格式)
    """
    try:
        params = {
            'type': 'pdd.ddk.goods.search',
            'client_id': client_id,
            'timestamp': int(time.time()),
            'page': page,
            'page_size': page_size,
            'keyword': keyword,
            'pid': pid,
            'custom_parameters': '{"source": "custom_value"}'
        }

        # 生成签名
        params['sign'] = generate_sign(params, client_secret)
        url = 'https://gw-api.pinduoduo.com/api/router'
        response = requests.post(url, data=params, timeout=10)  # 设置超时时间为 10 秒

        # 判断响应状态
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"请求失败，状态码: {response.status_code}, 响应: {response.text}")
            return {"error": f"请求失败: {response.text}"}
    except requests.exceptions.RequestException as e:
        logger.error(f"请求发生异常: {e}", exc_info=True)
        return {"error": str(e)}

def deduplicate_goods(result_list):
    """
    根据 goods_id 对 result_list 进行去重, 保留 goods_id 相同商品的第一个。

    :param result_list: 包含商品的列表，每个商品是一个字典，需包含 'goods_id' 字段
    :return: 去重后的商品列表
    """
    seen_goods_ids = set()  # 用于存储已处理的 goods_id
    deduplicated_list = []  # 用于存储去重后的结果

    for item in result_list:
        goods_id = item.get("goods_id")
        if goods_id not in seen_goods_ids:
            seen_goods_ids.add(goods_id)
            deduplicated_list.append(item)  # 只有没见过的 goods_id 才加入结果列表

    return deduplicated_list

def search_goods_by_keyword(keyword, client_id, client_secret, pid, page_size=60, page_limit=0):
    """
    使用拼多多 API 搜索商品关键字并返回结果列表
    :param keyword: 搜索关键字
    :param client_id: 拼多多 API 的 Client ID
    :param client_secret: 拼多多 API 的 Client Secret
    :param pid: 推广位 ID
    :param page_size: 每页的商品数量 (默认 60)
    :param page_limit: 页码限制，0 表示不限制
    :return: 符合条件的商品列表
    """
    page = 1
    result_list = []

    while True:
        # 检查页码限制
        if page_limit > 0 and page > page_limit:
            logger.info(f"达到页码限制 ({page_limit})，停止搜索")
            break

        result = pdd_goods_search(page, page_size, keyword, client_id, client_secret, pid)

        # 判断是否有错误
        if "error" in result:
            logger.error(f"第 {page} 页请求失败: {result['error']}")
            break

        # 提取商品列表
        goods_list = result.get('goods_search_response', {}).get('goods_list', [])
        logger.info(f"第 {page} 页商品数量: {len(goods_list)}")

        # 增量存储日志
        incremental_logger.info(json.dumps({
            "page": page,
            "keyword": keyword,
            "goods_count": len(goods_list),
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
        }, ensure_ascii=False))

        # 如果没有更多商品，退出循环
        if not goods_list:
            break

        # 筛选符合条件的商品并添加到结果列表
        for item in goods_list:
            result_list.append(item)
            # if keyword in item.get('goods_desc', ''):
            #     result_list.append(item)

        # 下一页
        page += 1

    # 对result_list进行去重，goods_id相同的商品只保留一个
    result_list = deduplicate_goods(result_list)
    # 将result_list保存到文件temp.json
    with open('temp.json', 'w', encoding='utf-8') as f:
        json.dump(result_list, f, ensure_ascii=False, indent=4)
    logger.info(f"搜索完成，共找到 {len(result_list)} 个符合条件的商品\n")

    return result_list


if __name__ == "__main__":
    # 配置信息
    client_id = get_config('client_id')
    client_secret = get_config('client_secret')
    pid = get_config('pid')

    # 搜索关键字
    keyword = "鸭货"

    # 调用函数获取搜索结果
    logger.info(f"开始搜索关键字: {keyword}")
    result = search_goods_by_keyword(keyword, client_id, client_secret, pid, page_limit=5)

    # 保存最终结果
    output_file = 'keyword_goods.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)
    logger.info(f"搜索结果已保存到文件: {output_file}")