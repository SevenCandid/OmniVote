import pytest
from typing import Generator
from fastapi.testclient import TestClient

from app.factory import create_app

@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    app = create_app()
    with TestClient(app) as c:
        yield c
