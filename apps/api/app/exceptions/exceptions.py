from typing import Any, Dict, List, Optional

class AppException(Exception):
    """Base exception for all domain-specific application errors."""
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = 500,
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or []

class NotFoundException(AppException):
    """Raised when a requested resource does not exist."""
    def __init__(
        self,
        message: str = "Resource not found.",
        code: str = "NOT_FOUND",
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(message=message, code=code, status_code=404, details=details)

class UnauthorizedException(AppException):
    """Raised when request authentication fails or credentials are missing."""
    def __init__(
        self,
        message: str = "Authentication required.",
        code: str = "UNAUTHORIZED",
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(message=message, code=code, status_code=401, details=details)

class ForbiddenException(AppException):
    """Raised when permissions are insufficient for the request."""
    def __init__(
        self,
        message: str = "Access forbidden.",
        code: str = "FORBIDDEN",
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(message=message, code=code, status_code=403, details=details)

class ValidationException(AppException):
    """Raised when fields or parameters fail validation rules."""
    def __init__(
        self,
        message: str = "Validation failed on input parameters.",
        code: str = "VALIDATION_ERROR",
        details: Optional[List[Dict[str, Any]]] = None,
    ):
        super().__init__(message=message, code=code, status_code=422, details=details)
