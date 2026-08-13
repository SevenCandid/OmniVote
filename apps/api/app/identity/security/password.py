import secrets
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Argon2 configuration optimized for low-memory micro VMs (e.g. 256MB on Fly.io)
ph = PasswordHasher(
    time_cost=2,
    memory_cost=19456,  # ~19MB RAM instead of 64MB
    parallelism=2,      # 2 threads instead of 4 (better for 1 vCPU)
    hash_len=32,
    salt_len=16
)


def get_password_hash(password: str) -> str:
    """Generate an Argon2 hash from a plaintext password."""
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against an Argon2 hash.
    Automatically handles constant-time comparisons securely via argon2-cffi.
    """
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False


def needs_rehash(hashed_password: str) -> bool:
    """Check if the password hash needs to be updated based on current Argon2 params."""
    return ph.check_needs_rehash(hashed_password)


def generate_secure_token(length: int = 43) -> str:
    """Generate a cryptographically secure random token (e.g., for refresh tokens or verification)."""
    return secrets.token_urlsafe(length)
