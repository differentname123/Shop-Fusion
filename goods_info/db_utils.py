import requests
import json
from datetime import datetime

from goods_info.common_utils import get_config

# ===================== 用户需要填写的参数 =====================
APP_ID = get_config("APP_ID")  # 替换为你的小程序 AppID
APP_SECRET = get_config("APP_SECRET")  # 替换为你的小程序 AppSecret
ENV_ID = get_config("ENV_ID")  # 替换为你的云开发环境 ID
COLLECTION_NAME = 'goodsInfo'  # 替换为你的数据库集合名称


# ===========================================================


def get_access_token():
    """
    获取小程序的 access_token
    """
    url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={APP_ID}&secret={APP_SECRET}"
    response = requests.get(url)
    result = response.json()
    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception(f"获取 access_token 失败: {result}")


class Cloud:
    def __init__(self, env, collection_name, schema, unique_fields):
        """
        初始化
        :param env: 云开发环境 ID
        :param collection_name: 数据库集合名称
        :param schema: 数据模式 (Schema)，定义表字段格式
        :param unique_fields: 用于唯一性校验的字段列表
        """
        self.env = env
        self.collection_name = collection_name
        self.access_token = get_access_token()
        self.schema = schema  # 数据模式
        self.unique_fields = unique_fields  # 唯一性校验字段

        # 云开发 API URL
        self.query_url = f"https://api.weixin.qq.com/tcb/databasequery?access_token={self.access_token}"
        self.add_url = f"https://api.weixin.qq.com/tcb/databaseadd?access_token={self.access_token}"
        self.update_url = f"https://api.weixin.qq.com/tcb/databaseupdate?access_token={self.access_token}"

    def query(self, search_param):
        """
        查询数据库
        :param search_param: 查询条件 (字典形式)
        :return: 查询结果 (JSON 格式)
        """
        query = f"db.collection('{self.collection_name}').where({json.dumps(search_param)}).get()"
        post_data = {
            "env": self.env,
            "query": query
        }
        response = requests.post(self.query_url, data=json.dumps(post_data))
        return response.json()

    def update(self, search_param, update_data):
        """
        更新数据库记录
        :param search_param: 查询条件 (字典形式)
        :param update_data: 更新内容 (字典形式)
        :return: 操作结果 (JSON 格式)
        """
        query = f"db.collection('{self.collection_name}').where({json.dumps(search_param)}).update({{'data': {json.dumps(update_data)}}})"
        post_data = {
            "env": self.env,
            "query": query
        }
        response = requests.post(self.update_url, data=json.dumps(post_data))
        return response.json()

    def _validate_and_format(self, data):
        """
        校验和格式化数据
        :param data: 待校验的数据 (字典形式)
        :return: 格式化后的数据
        """
        formatted_data = {}
        for field, rules in self.schema.items():
            # 检查必填字段
            if rules.get("required", False) and field not in data:
                raise ValueError(f"字段 '{field}' 是必填项，但未提供")

            # 检查字段类型
            value = data.get(field)
            if value is not None:  # 允许非必填项为空
                expected_type = rules.get("type")
                if not isinstance(value, expected_type):
                    # 尝试进行类型转换
                    try:
                        value = expected_type(value)
                    except (ValueError, TypeError):
                        raise ValueError(f"字段 '{field}' 的值必须是 {expected_type.__name__} 类型，当前值: {value}")

            # 默认值处理
            if value is None and "default" in rules:
                value = rules["default"]

            # 格式化后的字段
            formatted_data[field] = value

        # 自动添加创建时间和修改时间
        now = datetime.now().isoformat()
        formatted_data["updateTime"] = now
        if "createTime" not in data:
            formatted_data["createTime"] = now

        return formatted_data

    def _is_duplicate(self, data):
        """
        判断数据是否重复
        :param data: 待校验的数据 (字典形式)
        :return: 是否重复 (True/False)，以及重复数据的查询结果
        """
        search_param = {field: data[field] for field in self.unique_fields if field in data}
        result = self.query(search_param)
        return result.get("pager", {}).get("Total", 0) > 0, result

    def add(self, new_data):
        """
        添加记录到数据库
        :param new_data: 新增数据 (列表形式，每个元素为字典)
        :return: 操作结果日志 (字典)
        """
        if not isinstance(new_data, list):
            raise ValueError("新增数据必须是列表形式")

        success_count = 0
        update_count = 0
        failed_count = 0
        detailed_logs = []

        for item in new_data:
            try:
                # 校验和格式化
                formatted_data = self._validate_and_format(item)
                # 检查是否重复
                is_duplicate, duplicate_result = self._is_duplicate(formatted_data)
                if is_duplicate:
                    # 如果重复则进行更新操作
                    search_param = {field: formatted_data[field] for field in self.unique_fields}
                    update_result = self.update(search_param, formatted_data)
                    if update_result.get("errcode") == 0:
                        update_count += 1
                        detailed_logs.append({"status": "updated"})
                    else:
                        failed_count += 1
                        detailed_logs.append({"status": "failed", "reason": update_result.json()})
                    continue

                # 如果不重复，则插入数据
                query = f"db.collection('{self.collection_name}').add({{'data': [{json.dumps(formatted_data)}]}})"
                post_data = {
                    "env": self.env,
                    "query": query
                }
                response = requests.post(self.add_url, data=json.dumps(post_data))
                if response.json().get("errcode") == 0:
                    success_count += 1
                    detailed_logs.append({"status": "success"})
                else:
                    failed_count += 1
                    detailed_logs.append({"status": "failed", "reason": response.json()})
            except Exception as e:
                failed_count += 1
                detailed_logs.append({"status": "failed", "reason": str(e)})
        return {
            "total": len(new_data),
            "success": success_count,
            "updated": update_count,
            "failed": failed_count,
            # "details": detailed_logs
        }


if __name__ == "__main__":
    # 定义 goodsInfo 的数据模式 (Schema)
    goods_schema = {
        "goodsId": {"type": str, "required": True},  # 唯一标识
        "goodsSign": {"type": str, "required": True},  # 唯一标识
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

    # 唯一性校验字段
    unique_fields = ["goodsId", "goodsSign"]

    # 初始化 Cloud 类
    cloud = Cloud(env=ENV_ID, collection_name=COLLECTION_NAME, schema=goods_schema, unique_fields=unique_fields)

    # 测试新增数据
    new_data = [
        {
            "goodsId": "649553632705",
            "goodsSign": "E932M8VSLoRgMvVRwfDeGT4d_Or5M1DWbQ_J5ggeXyuN",
            "hdThumbUrl": "https://img.pddpic.com/mms-material-img/2024-09-12/ca0b09f6-d581-442a-acfd-9b5d28589ffd.jpeg",
            "goodsName": "德芙草莓香米巧克力清新盒装莓你不可礼盒休闲送女友网红盒装正品",
            "originActivityPrice": 1820,
            "goodsType": "pdd",
            "brand": "德芙",
            "category_name": "食品",
            "mallName": "洽洽坚果官方旗舰店"
        },
        {
            "goodsId": "649553632705",
            "goodsSign": "E932M8VSLoRgMvVRwfDeGT4d_Or5M1DWbQ_J5ggeXyuN",
            "hdThumbUrl": "https://img.pddpic.com/mms-material-img/2024-09-12/ca0b09f6-d581-442a-acfd-9b5d28589ffd.jpeg",
            "goodsName": "德芙草莓香米巧克力清新盒装莓你不可礼盒休闲送女友网红盒装正品",
            "originActivityPrice": 1820,
            "priceReduce": 470,
            "goodsType": "pdd",
            "promotionRate": 0,
            "promotionUrl": "https://mobile.yangkeduo.com/goods.html?goods_id=649553632705",
            "promotionPath": "https://mobile.yangkeduo.com/goods.html?goods_id=649553632705",
            "originUrl": "https://mobile.yangkeduo.com/goods.html?goods_id=649553632705",
            "mallName": "洽洽坚果官方旗舰店",
            "brand": "德芙",
            "category_name": "食品",
            "sales_tip": "5.33万"
        }
    ]

    result = cloud.add(new_data)
    print("新增结果:", json.dumps(result, indent=4, ensure_ascii=False))