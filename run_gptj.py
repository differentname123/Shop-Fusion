from transformers import AutoTokenizer, AutoModelForCausalLM

# 指定模型名称，例如 distilgpt2
model_name = "distilgpt2"

# 下载 tokenizer 和模型到指定本地路径
local_path = "/your/local/path"

# 下载 tokenizer 和模型的本地缓存
tokenizer = AutoTokenizer.from_pretrained(model_name, cache_dir=local_path)
model = AutoModelForCausalLM.from_pretrained(model_name, cache_dir=local_path)

# 测试生成
input_text = "Once upon a time,"
input_ids = tokenizer(input_text, return_tensors="pt").input_ids

# 生成输出
with torch.no_grad():
    output_ids = model.generate(input_ids, max_length=50)

# 解码输出
output_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)
print(output_text)