import json
import logging
import time

from goods_info.common_utils import get_config
from goods_info.db_utils import Cloud
from goods_info.pdd.search_goods_by_keyword_pdd import search_goods_by_keyword
from goods_info.pdd.promotion_url_generate import generate_promotion_urls

# 日志配置
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)




def convert_to_goods_schema(batch, goods_schema, goods_Type="pdd"):
    """
    将 batch 数据转换为符合 goods_schema 的数据格式。

    :param batch: List[Dict]，包含原始商品数据的列表
    :param goods_schema: Dict，商品字段的 schema 描述
    :param goods_Type: str，默认为 "pdd"
    :return: List[Dict]，符合 goods_schema 的数据列表
    """
    converted_list = []

    for item in batch:
        converted_item = {}
        for key, rules in goods_schema.items():
            # 提取字段对应的值
            if key == "goodsId":
                converted_item[key] = str(item.get("goods_id"))
            elif key == "goodsSign":
                converted_item[key] = item.get("goods_sign")
            elif key == "hdThumbUrl":
                converted_item[key] = item.get("goods_thumbnail_url")
            elif key == "goodsName":
                converted_item[key] = item.get("goods_name")
            elif key == "originActivityPrice":
                converted_item[key] = item.get("min_group_price")
            elif key == "priceReduce":
                converted_item[key] = item.get("coupon_discount", rules.get("default", 0))
            elif key == "goodsType":
                converted_item[key] = goods_Type
            elif key == "promotionRate":
                converted_item[key] = item.get("promotion_rate", rules.get("default", 0))
            elif key == "promotionUrl":
                converted_item[key] = item.get("promotion_url")
            elif key == "promotionPath":
                converted_item[key] = item.get("wx_path")
            elif key == "mallName":
                converted_item[key] = item.get("mall_name")
            elif key == "brand":
                converted_item[key] = item.get("brand_name", "未知品牌")
            elif key == "category_name":
                converted_item[key] = item.get("category_name")
            elif key == "salesTip":
                converted_item[key] = item.get("sales_tip", "")
            else:
                if rules.get("required", False):
                    raise ValueError(f"缺少必需字段: {key}")
                converted_item[key] = rules.get("default")

        # 检查必需字段
        for key, rules in goods_schema.items():
            if rules["required"] and key not in converted_item:
                raise ValueError(f"缺少必需字段: {key} in item {item}")

        converted_list.append(converted_item)

    return converted_list


def process_batch(batch, batch_index, client_id, client_secret, pid, goods_schema, cloud):
    """
    处理单个批次的商品数据。
    """
    try:
        logger.info(f"开始处理第 {batch_index} 批次，包含 {len(batch)} 个商品")

        # 提取 goods_sign
        goods_sign_list = [item['goods_sign'] for item in batch if 'goods_sign' in item]
        goods_sign_list_json = json.dumps(goods_sign_list)

        # 调用推广链接生成接口
        response = generate_promotion_urls(goods_sign_list_json, client_id, client_secret, pid)
        temp_list = response.get('goods_promotion_url_generate_response', {}).get('goods_promotion_url_list', [])

        if len(temp_list) != len(goods_sign_list):
            logger.warning(
                f"第 {batch_index} 批次有 {len(goods_sign_list)} 个商品，但仅返回 {len(temp_list)} 个推广链接"
            )
        else:
            for index, item in enumerate(batch):
                item['promotion_url'] = temp_list[index].get('mobile_url', '')
                item['wx_path'] = temp_list[index].get('we_app_info', {}).get('page_path', '')

            # 转换为符合 schema 的数据
            db_batch = convert_to_goods_schema(batch, goods_schema)
            start = time.time()
            db_response = cloud.add(db_batch)

            logger.info(f"第 {batch_index} 批次处理完成，成功插入 {len(db_batch)} 条数据 {db_response} 耗时 {time.time() - start:.2f} 秒 \n")
    except Exception as e:
        logger.error(f"第 {batch_index} 批次处理失败: {e}", exc_info=True)


if __name__ == "__main__":
    # 搜索关键字
    keyword = "开心果"

    # 配置信息
    client_id = get_config('client_id')
    client_secret = get_config('client_secret')
    pid = get_config('pid')

    APP_ID = get_config('APP_ID')
    APP_SECRET = get_config('APP_SECRET')
    ENV_ID = get_config('ENV_ID')
    COLLECTION_NAME = 'goodsInfo'

    goods_schema = {
        "goodsId": {"type": str, "required": True},
        "goodsSign": {"type": str, "required": True},
        "hdThumbUrl": {"type": str, "required": True},
        "goodsName": {"type": str, "required": True},
        "originActivityPrice": {"type": int, "required": True},
        "priceReduce": {"type": int, "required": False, "default": 0},
        "goodsType": {"type": str, "required": True},
        "promotionRate": {"type": int, "required": False, "default": 0},
        "promotionUrl": {"type": str, "required": False},
        "promotionPath": {"type": str, "required": False},
        "mallName": {"type": str, "required": True},
        "brand": {"type": str, "required": True},
        "category_name": {"type": str, "required": True},
        "salesTip": {"type": str, "required": False}
    }

    unique_fields = ["goodsId", "goodsSign"]

    # 初始化 Cloud 类
    cloud = Cloud(env=ENV_ID, collection_name=COLLECTION_NAME, schema=goods_schema, unique_fields=unique_fields)

    # 调用函数获取搜索结果
    result = search_goods_by_keyword(keyword, client_id, client_secret, pid, page_limit=1)

    # 按每 10 个划分为一个批次
    batch_size = 10
    batches = [result[i:i + batch_size] for i in range(0, len(result), batch_size)]

    logger.info(f"共分为 {len(batches)} 个批次，每批次包含最多 {batch_size} 条数据")

    # 遍历每个批次
    for batch_index, batch in enumerate(batches, start=1):
        process_batch(batch, batch_index, client_id, client_secret, pid, goods_schema, cloud)

    logger.info("所有批次处理完成")