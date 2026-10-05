import sys
import types
from pathlib import Path

# Ensure 'backend' and 'backend.app' resolve cleanly whether running from the
# repository root (e.g. pytest, local uvicorn backend.app.main:app) or from
# within the backend directory (e.g. Vercel backend service entrypoint app.main:app).
_app_dir = Path(__file__).resolve().parent
_backend_dir = _app_dir.parent

if str(_backend_dir.parent) not in sys.path:
    sys.path.insert(0, str(_backend_dir.parent))

if "backend" not in sys.modules:
    try:
        import backend  # noqa: F401
    except ModuleNotFoundError:
        _backend_pkg = types.ModuleType("backend")
        _backend_pkg.__path__ = [str(_backend_dir)]
        sys.modules["backend"] = _backend_pkg

if "backend.app" not in sys.modules:
    try:
        import app
        sys.modules["backend.app"] = app
    except ImportError:
        pass
