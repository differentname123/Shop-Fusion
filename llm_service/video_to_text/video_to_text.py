import os
import copy
import warnings
from decord import VideoReader, cpu
from PIL import Image
import numpy as np
import torch
from llava.model.builder import load_pretrained_model
from llava.mm_utils import tokenizer_image_token
from llava.constants import IMAGE_TOKEN_INDEX, DEFAULT_IMAGE_TOKEN
from llava.conversation import conv_templates

# 忽略 PyTorch 的警告
warnings.filterwarnings("ignore", category=UserWarning, module="torch.nn.modules.module")
warnings.filterwarnings("ignore", category=UserWarning, module="torch.nn.modules.module")

# 设置代理（如果需要）
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'


# ========================
# 模块化函数定义
# ========================

def load_video_frames(video_path, fps=1, resolution=(224, 224)):
    """
    加载视频并采样帧。

    Args:
        video_path (str): 视频文件路径。
        fps (int): 每秒采样帧数。
        resolution (tuple): 帧的目标分辨率 (width, height)。

    Returns:
        tuple: 采样的帧 (numpy array), 帧对应时间点 (list), 视频总时长 (float)。
    """
    vr = VideoReader(video_path, ctx=cpu(0), num_threads=1)
    total_frame_num = len(vr)
    video_time = total_frame_num / vr.get_avg_fps()
    sample_interval = round(vr.get_avg_fps() / fps)  # 计算采样间隔
    frame_idx = [i for i in range(0, len(vr), sample_interval)]
    frame_time = [i / vr.get_avg_fps() for i in frame_idx]

    # 获取采样帧
    sampled_frames = vr.get_batch(frame_idx).asnumpy()

    # 调整分辨率以减少显存占用
    processed_frames = [Image.fromarray(frame).resize(resolution) for frame in sampled_frames]
    processed_frames = np.stack([np.array(frame) for frame in processed_frames], axis=0)

    return processed_frames, frame_time, video_time


def preprocess_frames(frames, image_processor, device, batch_size=16):
    """
    批量预处理视频帧。

    Args:
        frames (numpy array): 视频帧数组。
        image_processor: 图像处理器。
        device (str): 设备 ("cuda" or "cpu")。
        batch_size (int): 每批次的帧数。

    Returns:
        list: 每批次处理后的帧数据。
    """
    processed_batches = []
    for i in range(0, len(frames), batch_size):
        batch = frames[i:i + batch_size]
        processed_batch = image_processor.preprocess(batch, return_tensors="pt")["pixel_values"].to(device).to(
            torch.bfloat16)
        processed_batches.append(processed_batch)
    return processed_batches


def generate_summary(model, tokenizer, processed_batches, question, device, max_new_tokens=4096):
    """
    批量生成视频摘要。

    Args:
        model: 预训练模型。
        tokenizer: 分词器。
        processed_batches (list): 批量处理后的帧数据。
        question (str): 输入问题。
        device (str): 设备 ("cuda" or "cpu")。
        max_new_tokens (int): 最大生成的 token 数。

    Returns:
        str: 视频摘要。
    """
    input_ids = tokenizer_image_token(question, tokenizer, IMAGE_TOKEN_INDEX, return_tensors="pt").unsqueeze(0).to(
        device).to(torch.long)
    attention_mask = torch.ones_like(input_ids, dtype=torch.long).to(device)

    outputs = []
    for batch in processed_batches:
        output = model.generate(
            input_ids,
            attention_mask=attention_mask,
            images=[batch],
            modalities=["video"],
            do_sample=False,
            temperature=0,
            max_new_tokens=max_new_tokens,
        )
        outputs.append(tokenizer.batch_decode(output, skip_special_tokens=True)[0].strip())

    return " ".join(outputs)


def build_question(video_time, frame_time):
    """
    构造输入模型的问题。

    Args:
        video_time (float): 视频总时长。
        frame_time (list): 采样帧的时间点。

    Returns:
        str: 构造的问题字符串。
    """
    time_instruction = (
            f"视频总时长为 {video_time:.2f} 秒，从视频中每秒采样了一帧，共采样了 {len(frame_time)} 帧。这些帧的时间点分别为："
            + ", ".join([f"{t:.2f}s" for t in frame_time])
            + "。请根据这些帧回答下列问题。"
    )
    question = DEFAULT_IMAGE_TOKEN + f"\n{time_instruction}\n请用中文详细描述这个视频的内容。"
    return question


# ========================
# 主程序
# ========================

def main():
    # 模型配置
    pretrained = "lmms-lab/LLaVA-Video-7B-Qwen2"
    model_name = "llava_qwen"
    device = "cuda" if torch.cuda.is_available() else "cpu"
    device_map = "auto"

    # 加载预训练模型
    tokenizer, model, image_processor, max_length = load_pretrained_model(
        pretrained, None, model_name, torch_dtype="bfloat16", device_map=device_map, attn_implementation="eager"
    )
    model.eval()

    # 加载视频
    video_path = "27134529061-1-16.mp4"  # 替换为实际的视频文件路径
    resolution = (224, 224)  # 降低分辨率以节省显存
    fps = 1  # 每秒采样一帧
    video_frames, frame_time, video_time = load_video_frames(video_path, fps=fps, resolution=resolution)

    # 预处理视频帧
    batch_size = 16  # 每批处理帧数
    processed_batches = preprocess_frames(video_frames, image_processor, device, batch_size=batch_size)

    # 构造对话模板
    conv_template = "qwen_1_5"
    conv = copy.deepcopy(conv_templates[conv_template])
    question = build_question(video_time, frame_time)
    print(question)
    conv.append_message(conv.roles[0], question)
    conv.append_message(conv.roles[1], None)
    prompt_question = conv.get_prompt()

    # 生成视频摘要
    print("生成视频摘要中，请稍候...")
    try:
        summary = generate_summary(model, tokenizer, processed_batches, prompt_question, device)
        print("视频摘要：")
        print(summary)
    except Exception as e:
        print("生成摘要时出错：", str(e))


# ========================
# 程序入口
# ========================

if __name__ == "__main__":
    main()