import os
from datasets import Dataset
from transformers import BertTokenizerFast, BertForTokenClassification, Trainer, TrainingArguments
import torch
import shutil

# Step 1: 读取BIO格式的数据文件
def read_bio_file(file_path):
    sentences = []
    labels = []
    sentence = []
    label = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip() == "":
                if sentence:
                    sentences.append(sentence)
                    labels.append(label)
                    sentence = []
                    label = []
            else:
                splits = line.strip().split()
                sentence.append(splits[0])
                label.append(splits[1])
        # Add the last sentence if the file does not end with a blank line
        if sentence:
            sentences.append(sentence)
            labels.append(label)
    return {"tokens": sentences, "ner_tags": labels}

# Step 2: 读取并转换数据
def load_dataset_from_bio(file_path):
    data = read_bio_file(file_path)
    dataset = Dataset.from_dict(data)
    return dataset

# Step 3: 加载数据
train_dataset = load_dataset_from_bio("cleaned_bio_data.txt")

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

# Step 5: 加载BERT的分词器
tokenizer = BertTokenizerFast.from_pretrained('bert-base-chinese')

# Step 6: 数据预处理，将tokens和标签对齐
def tokenize_and_align_labels(examples):
    # 对输入的 tokens 进行分词，启用 truncation 和 padding
    tokenized_inputs = tokenizer(
        examples['tokens'],
        truncation=True,
        padding='max_length',
        max_length=128,
        is_split_into_words=True  # 告诉 tokenizer 输入是已经分词的
    )

    labels = []
    for i, label in enumerate(examples['ner_tags']):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        previous_word_idx = None
        label_ids = []
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif word_idx != previous_word_idx:
                label_ids.append(label_to_id[label[word_idx]])
            else:
                label_ids.append(-100)
            previous_word_idx = word_idx
        labels.append(label_ids)

    tokenized_inputs["labels"] = labels
    return tokenized_inputs

# Step 7: 将数据集映射到BERT输入格式
tokenized_train_dataset = train_dataset.map(tokenize_and_align_labels, batched=True)

# 如果 ./model 目录存在，清空它以确保保存的是最新的模型
if os.path.exists('./model'):
    shutil.rmtree('./model')

# Step 8: 加载BERT模型
model = BertForTokenClassification.from_pretrained('bert-base-chinese', num_labels=num_labels)

# Step 9: 定义训练参数
training_args = TrainingArguments(
    output_dir='./model',                      # 保存模型的目录
    eval_strategy="no",                        # 关闭验证，因为没有验证集
    learning_rate=3e-5,                        # 调整学习率
    per_device_train_batch_size=32,            # 增大批量大小
    num_train_epochs=5,                        # 增加训练轮数
    weight_decay=0.01,                         # 权重衰减
    save_steps=500,                            # 每500步保存一次模型
    save_total_limit=1,                        # 只保留最新的2个模型
    logging_dir='./logs',                      # 日志保存目录
    logging_steps=100,                         # 每100步记录日志
    lr_scheduler_type='linear',                # 使用线性学习率调度器
    fp16=True,                                 # 启用混合精度训练（如果硬件支持）
)

# Step 10: 初始化Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_train_dataset,
    tokenizer=tokenizer,
)

# Step 11: 开始训练
trainer.train()

# Step 12: 保存模型和分词器
model.save_pretrained('./model')  # 保存训练好的模型
tokenizer.save_pretrained('./model')  # 保存分词器

###########################
# 使用保存的模型进行推理 #
###########################

# Step 13: 加载训练好的模型和分词器
model = BertForTokenClassification.from_pretrained('./model')
tokenizer = BertTokenizerFast.from_pretrained('./model')

# 将模型设置为评估模式
model.eval()

# Step 14: 测试句子
test_sentence = "天虹牌坚果520g淡盐味开心果袋装批发坚果干果颗粒健康零食小吃"

# Step 15: 编码测试句子
inputs = tokenizer(test_sentence, return_tensors="pt", truncation=True, padding=True, max_length=128, is_split_into_words=False)

# Step 16: 使用模型进行推理
with torch.no_grad():  # 不需要计算梯度
    outputs = model(**inputs)

# Step 17: 获取预测的标签索引
predictions = torch.argmax(outputs.logits, dim=2)

# Step 18: 将预测的标签映射回原始标签
predicted_labels = [id_to_label[label_id.item()] for label_id in predictions[0]]

# Step 19: 打印分词后的tokens和对应的预测标签
tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])

# Step 20: 合并连续相同标签的词
final_labels = []
final_tokens = []
current_label = None
current_tokens = []

for token, label in zip(tokens, predicted_labels):
    if token == '[CLS]' or token == '[SEP]':  # 忽略特殊符号
        continue
    if token.startswith("##"):  # 处理子词，将它们连接到前面的词
        current_tokens.append(token[2:])
    else:
        # 如果当前有正在收集的词组，并且标签发生了变化，保存它们
        if current_label is not None and (label != current_label or label.startswith("B-")):
            final_tokens.append("".join(current_tokens))  # 将词组合并成一个词
            final_labels.append(current_label)
            current_tokens = []  # 清空当前词组

        # 开始收集新词组
        current_tokens.append(token)
        current_label = label

# 将最后一个词组添加到结果
if current_tokens:
    final_tokens.append("".join(current_tokens))
    final_labels.append(current_label)

# Step 21: 打印合并后的词和标签
for token, label in zip(final_tokens, final_labels):
    print(f"{token}: {label}")