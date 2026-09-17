"""Shared fixtures: local server URL, page wiring, console-error capture."""
import os
import pathlib

import pytest

BASE_URL = os.environ.get("LSP_BASE_URL", "http://127.0.0.1:4173")
ARTIFACTS = pathlib.Path(__file__).parent / "artifacts"


def pytest_configure(config):
    ARTIFACTS.mkdir(exist_ok=True)


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture
def console_errors(page):
    """Collect console errors and uncaught exceptions for the whole test."""
    errors = []
    page.on(
        "console",
        lambda msg: errors.append("console.%s: %s" % (msg.type, msg.text))
        if msg.type == "error"
        else None,
    )
    page.on("pageerror", lambda exc: errors.append("pageerror: %s" % exc))
    return errors


@pytest.fixture
def app(page, base_url, console_errors):
    """A page with the app loaded at the public landing screen."""
    from helpers import App

    page.set_viewport_size({"width": 1440, "height": 960})
    page.goto(base_url + "/lsp-unified-app.html", wait_until="networkidle")
    return App(page, console_errors)
