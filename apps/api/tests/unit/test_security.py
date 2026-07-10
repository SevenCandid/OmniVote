from app.core.security import verify_password, get_password_hash


def test_security_placeholders():
    """Verify that password security placeholder helpers function as expected."""
    assert verify_password("plain", "hashed") is False
    assert get_password_hash("password") == ""
