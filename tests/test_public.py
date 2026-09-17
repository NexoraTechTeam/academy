"""Guest (unauthenticated) surfaces: catalog browsing and talent search."""


def test_landing_offers_public_entry_points(app):
    body = app.page.locator("body").inner_text()
    assert "Browse Training Catalog" in body
    assert "Find Verified Talent" in body
    app.assert_healthy("public/landing")


def test_browse_catalog_without_login(app):
    app.page.get_by_role("button").filter(
        has_text="Browse Training Catalog"
    ).first.click()
    app.page.wait_for_timeout(300)
    assert app.page.locator("aside nav button").count() == 0, "guest got a role shell"
    app.assert_healthy("public/catalog")
    app.screenshot("public-catalog")


def test_find_talent_without_login(app):
    app.page.get_by_role("button").filter(has_text="Find Verified Talent").first.click()
    app.page.wait_for_timeout(300)
    app.assert_healthy("public/talent")
    app.screenshot("public-talent")
