def test_main_import():
    """Verify app.main imports successfully and configures app instance."""
    import app.main

    assert app.main.app is not None
