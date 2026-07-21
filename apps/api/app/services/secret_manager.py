import base64
import json
from cryptography.fernet import Fernet, InvalidToken
from app.core.config import settings
import structlog

logger = structlog.get_logger()

class SecretManager:
    """
    A dedicated Secret Management service responsible for symmetric encryption
    of sensitive platform configuration values (e.g., SMTP credentials, API keys).
    
    This abstracts the encryption mechanism so it can later be replaced by a
    managed KMS provider (AWS KMS, Azure Key Vault, etc.) without requiring
    changes to business logic.
    """
    
    def __init__(self):
        # We enforce that the key is provided from environment variables.
        # It should be a 32-byte url-safe base64-encoded string.
        key = settings.SECRET_MANAGER_KEY.encode("utf-8")
        try:
            self.fernet = Fernet(key)
        except Exception as e:
            logger.error("Failed to initialize SecretManager with the provided SECRET_MANAGER_KEY.", error=str(e))
            raise ValueError("Invalid SECRET_MANAGER_KEY configuration.") from e

    def encrypt_secret(self, plaintext: str) -> str:
        """
        Encrypt a plaintext string.
        Returns a base64 encoded string representing the encrypted token.
        """
        if plaintext is None:
            return None
        return self.fernet.encrypt(plaintext.encode("utf-8")).decode("utf-8")

    def decrypt_secret(self, encrypted_token: str) -> str:
        """
        Decrypt a previously encrypted token back to plaintext.
        """
        if not encrypted_token:
            return None
        try:
            return self.fernet.decrypt(encrypted_token.encode("utf-8")).decode("utf-8")
        except InvalidToken:
            logger.error("Failed to decrypt secret: Invalid token.")
            raise ValueError("Failed to decrypt the provided secret. The key may have changed or the data is corrupted.")
        except Exception as e:
            logger.error("Error during secret decryption.", error=str(e))
            raise ValueError("Error during decryption.") from e

    def encrypt_dict(self, data: dict) -> str:
        """
        Serialize a dictionary to JSON and encrypt it.
        Useful for storing complex secret payloads (e.g., OAuth client credentials).
        """
        if not data:
            return self.encrypt_secret("{}")
        json_str = json.dumps(data)
        return self.encrypt_secret(json_str)

    def decrypt_dict(self, encrypted_token: str) -> dict:
        """
        Decrypt an encrypted JSON payload back into a dictionary.
        """
        if not encrypted_token:
            return {}
        try:
            json_str = self.decrypt_secret(encrypted_token)
            return json.loads(json_str)
        except json.JSONDecodeError:
            logger.error("Failed to decode decrypted secret into JSON.")
            return {}
        except Exception:
            return {}

# Global instance
secret_manager = SecretManager()
