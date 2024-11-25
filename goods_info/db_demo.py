import requests
import json

# ===================== 用户需要填写的参数 =====================
# 1. 小程序的 AppID 和 AppSecret
APP_ID = 'wx86b334b9c84d4b21'  # 替换为你的小程序 AppID
APP_SECRET = '888'  # 替换为你的小程序 AppSecret

# 2. 云开发环境 ID
ENV_ID = 'demo-8g342rg41cedb115'  # 替换为你的云开发环境 ID

# 3. 数据库集合名称
COLLECTION_NAME = 'sales'  # 替换为你的数据库集合名称


# ===========================================================


def get_access_token():
    """
    获取小程序的 access_token
    """
    # 获取 access_token 的 URL
    url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={APP_ID}&secret={APP_SECRET}"

    # 发起请求
    response = requests.get(url)
    result = response.json()

    # 检查是否成功获取 access_token
    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception(f"获取 access_token 失败: {result}")


class Cloud:
    def __init__(self, env, collection_name):
        """
        初始化
        :param env: 云开发环境 ID
        :param collection_name: 数据库集合名称
        """
        self.env = env
        self.collection_name = collection_name
        self.access_token = get_access_token()

        # 云开发 API URL
        self.query_url = f"https://api.weixin.qq.com/tcb/databasequery?access_token={self.access_token}"
        self.add_url = f"https://api.weixin.qq.com/tcb/databaseadd?access_token={self.access_token}"
        self.update_url = f"https://api.weixin.qq.com/tcb/databaseupdate?access_token={self.access_token}"
        self.delete_url = f"https://api.weixin.qq.com/tcb/databasedelete?access_token={self.access_token}"

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

    def add(self, new_data):
        """
        添加记录到数据库
        :param new_data: 新增数据 (列表形式，每个元素为字典)
        :return: 操作结果 (JSON 格式)
        """
        query = f"db.collection('{self.collection_name}').add({{'data': {json.dumps(new_data)}}})"
        post_data = {
            "env": self.env,
            "query": query
        }
        response = requests.post(self.add_url, data=json.dumps(post_data))
        return response.json()

    def update(self, search_param, update_dict):
        """
        更新数据库记录
        :param search_param: 查询条件 (字典形式)
        :param update_dict: 更新内容 (字典形式)
        :return: 操作结果 (JSON 格式)
        """
        query = f"db.collection('{self.collection_name}').where({json.dumps(search_param)}).update({{'data': {json.dumps(update_dict)}}})"
        post_data = {
            "env": self.env,
            "query": query
        }
        response = requests.post(self.update_url, data=json.dumps(post_data))
        return response.json()

    def delete(self, search_param):
        """
        删除数据库记录
        :param search_param: 查询条件 (字典形式)
        :return: 操作结果 (JSON 格式)
        """
        query = f"db.collection('{self.collection_name}').where({json.dumps(search_param)}).remove()"
        post_data = {
            "env": self.env,
            "query": query
        }
        response = requests.post(self.delete_url, data=json.dumps(post_data))
        return response.json()


if __name__ == "__main__":
    # 初始化 Cloud 类
    cloud = Cloud(env=ENV_ID, collection_name=COLLECTION_NAME)

    # ===================== 测试增删改查功能 =====================

    # # 1. 新增记录
    # new_data = [
    #     {"name": "test", "price": 100, "language": "Python"}
    # ]
    # print("新增结果:", cloud.add(new_data))

    # 2. 查询记录
    search_param = {"name": "test"}
    print("查询结果:", cloud.query(search_param))

    # # 3. 更新记录
    # update_param = {"name": "test"}
    # update_data = {"price": 200}
    # print("更新结果:", cloud.update(update_param, update_data))

    # # 4. 查询更新后的记录
    # print("更新后查询结果:", cloud.query(update_param))
    #
    # # 5. 删除记录
    # delete_param = {"name": "test"}
    # print("删除结果:", cloud.delete(delete_param))
    #
    # # 6. 查询删除后的记录
    # print("删除后查询结果:", cloud.query({}))