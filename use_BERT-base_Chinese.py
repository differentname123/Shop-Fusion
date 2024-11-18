import os
from transformers import BertTokenizerFast, BertForTokenClassification
import torch
import torch.nn.functional as F
import time

###########################
# 使用保存的模型进行推理 #
###########################

# Step 4: 为NER任务定义标签列表
label_list = [
    "O", "B-Brand", "I-Brand", "B-Category", "I-Category", "B-Features", "I-Features",
    "B-Flavor", "I-Flavor", "B-Model", "I-Model", "B-Packaging", "I-Packaging",
    "B-ProductionDate", "I-ProductionDate", "B-Promotion", "I-Promotion",
    "B-Quantity", "I-Quantity", "B-Specification", "I-Specification",
    "B-Unit", "I-Unit", "B-Usage", "I-Usage", "B-Version", "I-Version"
]
num_labels = len(label_list)
label_to_id = {label: i for i, label in enumerate(label_list)}
id_to_label = {i: label for i, label in enumerate(label_list)}

# Step 13: 加载训练好的模型和分词器
model = BertForTokenClassification.from_pretrained('./model')
tokenizer = BertTokenizerFast.from_pretrained('./model')

# 将模型设置为评估模式
model.eval()


def analyze_sentence(sentence):
    # Step 15: 编码测试句子
    inputs = tokenizer(sentence, return_tensors="pt", truncation=True, padding=True, max_length=128,
                       is_split_into_words=False)

    # Step 16: 使用模型进行推理
    start_time = time.time()  # 记录开始时间
    with torch.no_grad():  # 不需要计算梯度
        outputs = model(**inputs)
    end_time = time.time()  # 记录结束时间

    # Step 17: 获取 `logits` 并计算每个标签的概率
    logits = outputs.logits  # (batch_size, seq_len, num_labels)
    probabilities = F.softmax(logits, dim=-1)  # 对最后一个维度应用 softmax 计算概率

    # Step 18: 获取预测的标签索引和对应的置信度
    predictions = torch.argmax(logits, dim=2)
    predicted_labels = [id_to_label[label_id.item()] for label_id in predictions[0]]

    # 获取每个预测标签的置信度
    predicted_confidences = [probabilities[0, i, label_id].item() for i, label_id in enumerate(predictions[0])]

    # Step 19: 打印分词后的tokens、对应的预测标签和置信度
    tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])

    # Step 20: 手动合并B-标签和对应的I-标签
    final_labels = []
    final_tokens = []
    final_confidences = []
    current_entity_tokens = []
    current_entity_label = None
    current_entity_confidence = []

    for token, label, confidence in zip(tokens, predicted_labels, predicted_confidences):
        if token == '[CLS]' or token == '[SEP]':  # 忽略特殊符号
            continue

        # 如果是B-标签，开始一个新实体
        if label.startswith("B-"):
            # 如果当前已经有一个正在收集的实体，先保存它
            if current_entity_tokens:
                final_tokens.append("".join(current_entity_tokens))
                final_labels.append(current_entity_label)
                final_confidences.append(sum(current_entity_confidence) / len(current_entity_confidence))  # 取平均置信度
                current_entity_tokens = []
                current_entity_confidence = []

            # 开始新的实体
            current_entity_tokens.append(token)
            current_entity_label = label
            current_entity_confidence.append(confidence)

        # 如果是I-标签，且和当前实体标签匹配，继续收集
        elif label.startswith("I-") and current_entity_label and label[2:] == current_entity_label[2:]:
            current_entity_tokens.append(token)
            current_entity_confidence.append(confidence)

        # 如果是O标签，或者和当前实体不匹配的标签，先保存之前的实体，再处理O或新实体
        else:
            if current_entity_tokens:
                final_tokens.append("".join(current_entity_tokens))
                final_labels.append(current_entity_label)
                final_confidences.append(sum(current_entity_confidence) / len(current_entity_confidence))  # 取平均置信度
                current_entity_tokens = []
                current_entity_confidence = []
            current_entity_label = None  # O标签不需要继续收集

    # 将最后一个未保存的实体添加到结果中
    if current_entity_tokens:
        final_tokens.append("".join(current_entity_tokens))
        final_labels.append(current_entity_label)
        final_confidences.append(sum(current_entity_confidence) / len(current_entity_confidence))  # 取平均置信度

    # Step 21: 打印合并后的词、标签和置信度
    print(f"\n分析结果：")
    for token, label, confidence in zip(final_tokens, final_labels, final_confidences):
        print(f"{token}: {label}, Confidence: {confidence:.4f}")

    # 打印消耗的时间
    print(f"\n预测耗时: {end_time - start_time:.4f} 秒")


# 主循环，获取输入并进行分析
while True:
    # 获取用户输入
    user_input = input("\nAI:")

    # 退出条件
    if user_input.lower() in ['exit', 'q']:
        print("退出程序。")
        break

    # 分析输入的句子
    analyze_sentence(user_input)