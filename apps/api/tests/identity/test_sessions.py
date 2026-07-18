from fastapi.testclient import TestClient

def test_list_and_revoke_sessions(client: TestClient):
    # Register and Login to create a session
    client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": "session@example.com",
            "password": "StrongPassword123!",
            "first_name": "Session",
            "last_name": "User"
        }
    )
    login_resp = client.post(
        "/api/v1/identity/auth/login",
        data={
            "username": "session@example.com",
            "password": "StrongPassword123!"
        }
    )
    assert login_resp.status_code == 200
    access_token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # List sessions
    list_resp = client.get("/api/v1/identity/sessions/", headers=headers)
    assert list_resp.status_code == 200
    sessions = list_resp.json()
    assert len(sessions) == 1
    session_id = sessions[0]["id"]
    
    # Revoke session
    revoke_resp = client.delete(f"/api/v1/identity/sessions/{session_id}", headers=headers)
    assert revoke_resp.status_code == 204
    
    # List sessions again, should be empty (since revoked_at is not null)
    list_resp2 = client.get("/api/v1/identity/sessions/", headers=headers)
    assert list_resp2.status_code == 200
    assert len(list_resp2.json()) == 0
