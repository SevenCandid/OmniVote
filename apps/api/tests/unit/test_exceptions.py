import pytest

from app.exceptions.exceptions import (
    AppException,
    DatabaseException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
)


def test_exception_instantiation():
    """Verify exception classes initialize with correct defaults."""
    e1 = AppException("Base err")
    assert e1.message == "Base err"
    assert e1.code == "INTERNAL_SERVER_ERROR"
    assert e1.status_code == 500

    e2 = NotFoundException()
    assert e2.status_code == 404
    assert e2.code == "NOT_FOUND"

    e3 = UnauthorizedException()
    assert e3.status_code == 401

    e4 = ForbiddenException()
    assert e4.status_code == 403

    e5 = ValidationException()
    assert e5.status_code == 422

    e6 = DatabaseException()
    assert e6.status_code == 500


@pytest.mark.anyio
async def test_exception_handlers():
    """Verify that custom exception handlers generate valid response payloads."""
    import json
    from fastapi.exceptions import RequestValidationError
    from starlette.exceptions import HTTPException as StarletteHTTPException
    from app.exceptions.handlers import (
        app_exception_handler,
        validation_exception_handler,
        starlette_http_exception_handler,
        general_exception_handler,
    )

    class MockRequest:
        def __init__(self):
            self.state = type(
                "State",
                (),
                {"request_id": "req-test-123", "correlation_id": "corr-test-456"},
            )()

    req = MockRequest()

    # Test app_exception_handler
    resp1 = await app_exception_handler(req, AppException("Oops", code="TEST_FAIL", status_code=400))
    assert resp1.status_code == 400
    body1 = json.loads(resp1.body.decode("utf-8"))
    assert body1["success"] is False
    assert body1["error"]["code"] == "TEST_FAIL"

    # Test validation_exception_handler
    errs = [{"loc": ["body", "username"], "msg": "field required", "type": "value_error.missing"}]
    resp2 = await validation_exception_handler(req, RequestValidationError(errs))
    assert resp2.status_code == 422
    body2 = json.loads(resp2.body.decode("utf-8"))
    assert body2["error"]["code"] == "VALIDATION_ERROR"
    assert body2["error"]["details"][0]["field"] == "username"

    # Test starlette_http_exception_handler
    resp3 = await starlette_http_exception_handler(req, StarletteHTTPException(status_code=404, detail="Not Found"))
    assert resp3.status_code == 404
    body3 = json.loads(resp3.body.decode("utf-8"))
    assert body3["error"]["code"] == "NOT_FOUND"

    # Test general_exception_handler
    resp4 = await general_exception_handler(req, ValueError("Severe failure"))
    assert resp4.status_code == 500
    body4 = json.loads(resp4.body.decode("utf-8"))
    assert body4["error"]["code"] == "INTERNAL_SERVER_ERROR"
