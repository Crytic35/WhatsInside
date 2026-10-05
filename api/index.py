"""
Vercel serverless entry point for the FastAPI backend.

Vercel's Python runtime imports the ASGI app from this file.
The `app` object here IS the FastAPI application created in backend/app/main.py.

Import path works because vercel.json sets the project root as the working
directory, so `backend` resolves as a package from the repo root.
"""
from backend.app.main import app  # noqa: F401  — re-exported as `app` for Vercel

__all__ = ["app"]
