import requests

url = "http://localhost:8080/upload_csv/"
files = {'file': open('/home/cjh/survillience_llm/rag_sys/raw_data/evt001_imgtest.csv', 'rb')}
response = requests.post(url, files=files)
print(response.json())