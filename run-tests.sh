#!/usr/bin/env bash
# Setup-free runner: starts the local static server if needed, then runs pytest.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENV="$ROOT/.venv"
PORT="${PORT:-4173}"
URL="http://127.0.0.1:$PORT/lsp-unified-app.html"

if [ ! -x "$VENV/bin/python" ]; then
  echo "Creating venv and installing Playwright ..."
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet playwright pytest pytest-playwright
  "$VENV/bin/playwright" install chromium
fi

if ! curl -sf -o /dev/null "$URL"; then
  echo "Starting local server on :$PORT ..."
  PORT="$PORT" python3 "$ROOT/.claude/serve.py" >/dev/null 2>&1 &
  SERVER_PID=$!
  trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
  until curl -sf -o /dev/null "$URL"; do sleep 0.3; done
fi

export LSP_BASE_URL="http://127.0.0.1:$PORT"
cd "$ROOT/tests"
exec "$VENV/bin/python" -m pytest "$@"
