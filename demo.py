from easynlp.appzoo import SequenceLabelingPredictor

predictor = SequenceLabelingPredictor(model_dir="path_to_model")
result = predictor.predict("三只松鼠 开心果 500g 无漂白")
print(result)