from flask import Flask, request, jsonify,render_template
import requests
from flask_cors import CORS  # 引入 CORS

app = Flask(__name__)
CORS(app)  # 启用 CORS

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get("message", "")
    if not user_input:
        return jsonify({"error": "Invalid input"}), 400
    try:
        response = requests.post('http://localhost:8000/generate', json={"message": user_input})
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
