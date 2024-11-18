import re

def clean_and_fix_bio_data(file_path, output_path):
    cleaned_data = []
    invalid_lines = []  # 用于存储无效行及其原因
    in_sentence = False  # 标记是否在处理一个句子
    last_label = None  # 记录前一个标签

    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            stripped_line = line.strip()

            if not stripped_line:  # 空行
                cleaned_data.append("")  # 保留空行以分隔样本
                in_sentence = False
                last_label = None
                continue
            if '2120TUA' in stripped_line:
                print(stripped_line)
            # 检查是否缺少空格的情况
            match = re.match(r"^(.*?)([BIO]-\S+)$", stripped_line)
            if match:
                char, label = match.groups()
                char = char.strip()
                reason = "Fixed missing space between character and label"
            else:
                parts = stripped_line.split()
                if len(parts) == 2:
                    char, label = parts
                    char = char.strip()
                    reason = None  # 无需修复
                else:
                    invalid_lines.append((line, "Invalid format: Not two parts (character and label)"))
                    continue

            # 检查标签格式是否正确
            if label.startswith(('B-', 'I-', 'O')) or label == 'O':
                # 标签一致性检查
                if label.startswith('I-'):
                    if last_label is None or not last_label.endswith(label[2:]):
                        # 修复 I- 标签为 B- 标签
                        reason = f"Inconsistent label: I-{label[2:]} without preceding B-{label[2:]}, fixing to B-{label[2:]}"
                        label = f"B-{label[2:]}"
                        invalid_lines.append((line, reason))
                # 判断 char 是不是空
                if not char:
                    invalid_lines.append((line, "Empty character"))
                    continue
                # 如果 char 包含空格，删除空格
                if ' ' in char:
                    char = char.replace(' ', '')
                    invalid_lines.append((line, "Removed space from character"))
                # 添加到清理后的数据
                cleaned_data.append(f"{char} {label}")
                last_label = label
                in_sentence = True
            else:
                invalid_lines.append((line, "Invalid label format"))

    # 打印无效行和原因
    if invalid_lines:
        print("Invalid lines detected or fixed:")
        for invalid_line, reason in invalid_lines:
            print(f"{invalid_line.strip()} --> {reason}")

    # 保存清理后的数据
    with open(output_path, 'w', encoding='utf-8') as output_file:
        output_file.write("\n".join(cleaned_data))

    print(f"\nData cleaning and fixing completed. Cleaned data saved to {output_path}")

# 使用指定的路径
input_path = 'opus_bio.txt'
output_path = 'cleaned_bio_data.txt'
clean_and_fix_bio_data(input_path, output_path)