from flask import Flask
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import os

app = Flask(__name__)

question_list = [
    '什么动物跑得快',
    '''可口可乐雪碧芬达多口味组合装500ml*18瓶汽水碳酸饮料夏季饮品
    天虹牌坚果520g淡盐味开心果袋装批发坚果干果颗粒健康零食小吃
    可口可乐1L*12瓶可乐/雪碧/芬达汽水碳酸饮料大瓶整箱装包邮
    无硫原色大颗粒开心果500克袋装无漂白盐焗味休闲零食坚果48g
    上面的每一行都是一个商品描述，我现在想提取一下商品的关键信息，方便后续后续的比价，最好能够提取一些能够量化的数据，方便后续的计算。''',
    '请问三个月的宝宝能玩什么游戏',
    '''2024最新全媒体自媒体运营师永久专业零基础新手AI直播变现教程
    2024多多运营视频教程虚拟产品实战手册课零基础新手小白入门网店
    正宗川味烧烤技术配方锡纸烧烤腌撒料烤苕皮豆干商用开店视频教程
    2024年10月叮当会电商8期61期54期等合集淘宝天猫无界逛逛
    已售10万+ 硬塑料试管 放免试管 外径12-20mm可带塞透苯试管透明
    上面的每一行都是一个商品描述，我现在想提取一下商品的关键信息，方便后续后续的比价，最好能够提取一些能够量化的数据，方便后续的计算。''',
    '''可口可乐1L*12瓶可乐/雪碧/芬达汽水碳酸饮料大瓶整箱装包邮
    无硫原色大颗粒开心果500克袋装无漂白盐焗味休闲零食坚果48g
    上面的每一行都是一个商品描述，帮我生成相应的BIO格式数据，Use the following entity types:

    Brand (brand name),
    Category (product type),
    Flavor (product flavor),
    Specification (size, weight, volume, etc.),
    Quantity (number of items),
    Packaging (packaging type),
    Promotion (promotional information),
    Usage (intended use),
    ProductionDate (production date),
    Features (product features),
    Unit (the unit of measurement).

    Please follow the exact BIO format, where:

    "B-<EntityType>" means the beginning of an entity.
    "I-<EntityType>" means the inside of an entity.
    "O" means the word is not part of any entity.
    Each word should be followed by its BIO label, separated by a space. Each word-label pair should be on a new line, and the BIO tags should strictly follow the format "B-<EntityType>" or "I-<EntityType>".

    给我完整的BIO数据，不要省略，回答内容只能包含BIO格式数据，不要包含其他任何内容。''',
    '你觉得vivox200promini这个手机怎么样'
]
prompt_path = "./prompt"

class ModelService:
    def __init__(self):
        os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
        os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

        model_name = "rombodawg/Rombos-LLM-V2.5-Qwen-32b"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            llm_int8_threshold=6.0,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=quantization_config,
            device_map="auto",
            trust_remote_code=True
        )
        self.model.eval()
        self.system_message = ""

    def set_system_message(self, system_message):
        self.system_message = system_message

    def generate_response(self, user_input):
        messages = [
            {"role": "system", "content": self.system_message},
            {"role": "user", "content": user_input}
        ]
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.model.device)
        with torch.no_grad():
            outputs = self.model.generate(
                **model_inputs,
                max_new_tokens=1000,
                do_sample=True,
                temperature=0.7,
                top_k=50,
                top_p=0.9
            )
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, outputs)
        ]
        response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return response

def process_prompts():
    model_service = ModelService()
    for filename in os.listdir(prompt_path):
        if filename.endswith(".txt"):
            file_base_name = os.path.splitext(filename)[0]
            with open(os.path.join(prompt_path, filename), 'r', encoding='utf-8') as prompt_file:
                system_message = prompt_file.read()

            model_service.set_system_message(system_message)
            record_filename = f"record_{file_base_name}.txt"

            with open(record_filename, "w", encoding="utf-8") as record_file:
                for question in question_list:
                    for _ in range(3):  # Ask each question 3 times
                        try:
                            response = model_service.generate_response(question)
                            record_file.write(f"Question: {question}\n")
                            record_file.write(f"Response: {response}\n\n")
                            print(f"Question: {question}")
                            print(f"Response: {response}\n")
                        except Exception as e:
                            record_file.write(f"Question: {question}\n")
                            record_file.write(f"Error: {str(e)}\n\n")

if __name__ == '__main__':
    process_prompts()
    print("Done!")