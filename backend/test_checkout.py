import urllib.request
import json

req = urllib.request.Request("http://localhost:8000/api/v1/subscriptions/checkout/", method="POST")
req.add_header("Content-Type", "application/json")
try:
    urllib.request.urlopen(req)
except Exception as e:
    print(e.read().decode())
