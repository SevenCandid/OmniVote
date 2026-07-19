import urllib.request
import urllib.parse
import json
import uuid

email = f"test_{uuid.uuid4()}@test.com"

# 1. Register user
req_reg = urllib.request.Request("http://localhost:8000/api/v1/identity/auth/register", data=json.dumps({"email": email, "first_name": "Test", "last_name": "User", "password": "password123"}).encode(), headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req_reg) as response:
        print("Reg status:", response.status)
except urllib.error.HTTPError as e:
    print("Reg failed:", e.code, e.read())

# activate user
import subprocess
subprocess.run(["docker", "exec", "-e", "PGPASSWORD=Nexra2026", "omnivote-postgres", "psql", "-U", "postgres", "-d", "omnivote", "-c", f"UPDATE identity_users SET status = 'active' WHERE email = '{email}';"])

# login
req_login = urllib.request.Request("http://localhost:8000/api/v1/identity/auth/login", data=urllib.parse.urlencode({"username": email, "password": "password123"}).encode())
try:
    with urllib.request.urlopen(req_login) as response:
        login_res = json.loads(response.read())
        token = login_res["access_token"]
except Exception as e:
    print("Login failed:", e)
    token = None

if token:
    # 2. Call organizations POST
    payload = {
        "name": f"Org {uuid.uuid4()}", 
        "slug": f"org-{uuid.uuid4()}",
        "website": None,
        "contact_email": None,
        "country": None,
        "contact_phone": None,
        "description": None
    }
    req2 = urllib.request.Request("http://localhost:8000/api/v1/organizations/", data=json.dumps(payload).encode(), headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req2) as response2:
            print(response2.status)
            print(response2.read())
    except urllib.error.HTTPError as e:
        print(e.code)
        print(e.read())
