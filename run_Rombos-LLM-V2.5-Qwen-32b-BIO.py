import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from datetime import datetime  # Import datetime module for current time

import os

# Set proxy (if needed), remove these lines if no proxy is required
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

# Model name
model_name = "rombodawg/Rombos-LLM-V2.5-Qwen-32b"

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

# Configure 4-bit quantization
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    llm_int8_threshold=6.0,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"
)

# Load model with 4-bit quantization
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=quantization_config,
    device_map="auto",  # Automatically assign device
    trust_remote_code=True
)

# Set model to evaluation mode
model.eval()

# Refined system message (in English, with Unit entity type)
system_message = """
You are a knowledgeable assistant. Please extract the key information from product descriptions and label them with BIO format. 
Use the following entity types: 
- Brand (brand name), 
- Category (product type), 
- Flavor (product flavor), 
- Specification (size, weight, volume, etc.), 
- Quantity (number of items), 
- Packaging (packaging type), 
- Promotion (promotional information), 
- Usage (intended use), 
- ProductionDate (production date), 
- Features (product features),
- Unit (the unit of measurement, such as ml, g, kg, etc.).

Please follow the exact BIO format, where:
- "B-<EntityType>" means the beginning of an entity.
- "I-<EntityType>" means the inside of an entity.
- "O" means the word is not part of any entity.

Each word should be followed by its BIO label, separated by a space. Each word-label pair should be on a new line, and the BIO tags should strictly follow the format "B-<EntityType>" or "I-<EntityType>".
"""

# Function to generate BIO tagging result for a single product description
def generate_bio(product_description):
    try:
        # Construct message list
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": f"Product description: {product_description}\nPlease convert the above product description into BIO format and label each word accordingly."}
        ]

        # Generate prompt text using chat template
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        # Encode the generated text as model input
        model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

        # Generate response, using greedy decoding
        with torch.no_grad():
            outputs = model.generate(
                **model_inputs,
                max_new_tokens=150,      # Maximum number of tokens to generate
                do_sample=False,         # Use greedy decoding (no sampling)
                top_k=0,                 # Top-k sampling can still be used with greedy decoding
                top_p=0,               # Top-p sampling can still be used with greedy decoding
            )

        # Extract generated content, removing input part
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, outputs)
        ]

        # Decode the generated text and remove special tokens
        response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

        return response
    except Exception as e:
        print(f"Error processing description: {product_description} - {str(e)}")
        return None

# Function to process the product descriptions from a file and save BIO results
def process_and_save_bio(input_file, output_file):
    bio_results = []  # To accumulate BIO results

    try:
        # Read product descriptions from input file
        with open(input_file, 'r', encoding='utf-8') as infile:
            descriptions = infile.readlines()

        total_descriptions = len(descriptions)  # Get total number of descriptions

        # Process each product description
        for index, description in enumerate(descriptions):
            description = description.strip()  # Remove leading/trailing whitespace

            if description:
                bio_result = generate_bio(description)  # Generate BIO tags

                if bio_result:
                    bio_results.append(f"Product: {description}\n{bio_result}\n")

            # Save progress every 10 descriptions
            if (index + 1) % 10 == 0:
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Get current time
                print(f"{current_time} - Processed {index + 1}/{total_descriptions} descriptions, saving to file...")
                save_bio_results(output_file, bio_results)
                bio_results = []  # Clear the list after saving

        # Save any remaining results at the end
        if bio_results:
            save_bio_results(output_file, bio_results)

        print("BIO tagging process completed.")
    except Exception as e:
        print(f"Error during processing: {str(e)}")

# Function to save BIO results to the output file
def save_bio_results(output_file, bio_results):
    try:
        with open(output_file, 'a', encoding='utf-8') as outfile:
            outfile.writelines(bio_results)
    except Exception as e:
        print(f"Error saving results to file: {str(e)}")

# Call the function to process the input file and save BIO results
input_file = 'temp1.txt'
output_file = 'temp_bio.txt'
process_and_save_bio(input_file, output_file)