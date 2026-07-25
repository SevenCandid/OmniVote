import urllib.request
import json
import urllib.error

url = 'http://localhost:8000/api/v1/organizations/019f7b17-7dbb-702b-93fd-87d4b6d6b6e6/elections/019f99d8-294f-7766-99f6-89c82065017b/voting/session'
data = json.dumps({"verification_method": "public"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as res:
        print(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.read().decode('utf-8'))
