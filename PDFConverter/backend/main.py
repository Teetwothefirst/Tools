# Vercel entrypoint shim — this file must live at the backend/ root.
# Vercel's Python runtime resolves the ASGI app from here via "main:app".
from app.main import app  # noqa: F401 — re-exported for Vercel

__all__ = ["app"]
