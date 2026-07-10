import pytest
from tests.factories.factories import UserFactory, OrganizationFactory, EventFactory


@pytest.fixture
def test_user():
    """Returns a generic test user dictionary fixture."""
    return UserFactory()


@pytest.fixture
def test_organization():
    """Returns a generic test organization dictionary fixture."""
    return OrganizationFactory()


@pytest.fixture
def test_event():
    """Returns a generic test event dictionary fixture."""
    return EventFactory()
