import numpy as np
import torch
from diffusers import MochiPipeline
from diffusers.utils import export_to_video
import os

torch.cuda.empty_cache()  # 每次释放显存

# （可选）代理设置
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'
pipe = MochiPipeline.from_pretrained("genmo/mochi-1-preview", variant="bf16", torch_dtype=torch.bfloat16)

# Enable memory savings
pipe.enable_model_cpu_offload()  # 模型部分移到CPU
pipe.enable_attention_slicing()  # 启用Attention Slicing
pipe.enable_vae_tiling()  # 启用VAE分块
# pipe.enable_sequential_cpu_offload()  # 可选：进一步优化显存使用


prompt = "A colorful bird flying in a clear blue sky."
frames = pipe(prompt, num_frames=2, height=128*4, width=128*4).frames[0]
print(type(frames))
print(np.array(frames).shape)  # 确认帧的形状

export_to_video(frames, "mochi.mp4", fps=1)
