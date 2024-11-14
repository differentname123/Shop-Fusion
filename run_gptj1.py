# Install requirements
# !pip install transformers==4.44.2 torch==2.3.1 flash_attn==2.5.8 accelerate==0.31.0

# Load model
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import os

# 设置代理（如果需要）
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

tokenizer = AutoTokenizer.from_pretrained("upstage/solar-pro-preview-instruct")
model = AutoModelForCausalLM.from_pretrained(
    "upstage/solar-pro-preview-instruct",
    device_map="cuda",  
    torch_dtype="auto",  
    trust_remote_code=True,
)
# Apply chat template
messages = [
    {"role": "user", "content": "Please, introduce yourself."},
]
prompt = tokenizer.apply_chat_template(messages, return_tensors="pt", add_generation_prompt=True).to(model.device)
# Generate text
outputs = model.generate(prompt, max_new_tokens=512)
print(tokenizer.decode(outputs[0]))
