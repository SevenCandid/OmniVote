def test_fixtures_initialize_correctly(test_user, test_organization, test_event):
    """Verify that test fixtures generate mock parameters correctly."""
    assert test_user["id"] is not None
    assert "@" in test_user["email"]
    assert test_user["is_active"] is True

    assert test_organization["id"] is not None
    assert test_organization["name"] is not None
    assert test_organization["slug"] is not None

    assert test_event["id"] is not None
    assert test_event["title"] is not None
    assert test_event["description"] is not None
