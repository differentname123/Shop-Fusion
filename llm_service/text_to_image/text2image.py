import torch
from diffusers import FluxPipeline
import os

# 设置代理
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

torch.cuda.empty_cache()

# 加载模型
pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-dev",
    torch_dtype=torch.float16  # 半精度推理
)

# 启用显存优化
pipe.enable_attention_slicing("auto")  # Attention Slicing
pipe.enable_sequential_cpu_offload()   # Sequential CPU Offload
pipe.enable_vae_tiling()               # VAE Tiling

# Prompt 和 Negative Prompt
prompt = (    "A realistic photo of a baby snuggling up next to its mother, both laughing happily. "
    "The background is a warm, cozy living room with soft natural lighting. "
    "The mother is wearing a blue sweater, and the baby has a yellow onesie. "
    "Highly detailed, ultra-realistic, 4k resolution, natural textures.")


negative_prompt = "blurry, cartoon, abstract, deformed, distorted, unrealistic"

# 生成图片
image = pipe(
    prompt,
    height=1024,               # 分辨率
    width=1024,
    guidance_scale=5.0,        # 提高 guidance_scale
    num_inference_steps=50,    # 增加推理步数
    generator=torch.Generator("cpu").manual_seed(0)
).images[0]

# 保存图片
image.save("flux-dev-optimized.png")