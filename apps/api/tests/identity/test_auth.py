from fastapi.testclient import TestClient

def test_register_user_success(client: TestClient):
    response = client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "StrongPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["status"] == "PENDING_VERIFICATION"
    assert "password" not in data

def test_register_duplicate_email(client: TestClient):
    # Register first
    client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "StrongPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    # Register again
    response = client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "StrongPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Email is already registered"

def test_login_success(client: TestClient):
    client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": "login@example.com",
            "password": "StrongPassword123!",
            "first_name": "Login",
            "last_name": "User"
        }
    )
    response = client.post(
        "/api/v1/identity/auth/login",
        data={
            "username": "login@example.com",
            "password": "StrongPassword123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password(client: TestClient):
    client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": "badpass@example.com",
            "password": "StrongPassword123!",
            "first_name": "Login",
            "last_name": "User"
        }
    )
    response = client.post(
        "/api/v1/identity/auth/login",
        data={
            "username": "badpass@example.com",
            "password": "WrongPassword!"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"
