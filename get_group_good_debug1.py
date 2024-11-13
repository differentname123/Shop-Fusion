import requests
context = "In a shocking finding, scientist discovered a herd of unicorns living in a remote, previously unexplored valley, in the Andes Mountains. Even more surprising to the researchers was the fact that the unicorns spoke perfect English."
payload = {
    "context": context,
    "token_max_length": 512,
    "temperature": 1.0,
    "top_p": 0.9,
}
response = requests.post("http://api.vicgalle.net:5000/generate", params=payload).json()
print(response)