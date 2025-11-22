import os
import dj_database_url
from .settings import *

DEBUG = False
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")

RENDER_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME")

ALLOWED_HOSTS = [
    RENDER_HOSTNAME,
    "hope-backend-mvos.onrender.com",
    "localhost",
]

CSRF_TRUSTED_ORIGINS = [
    f"https://{RENDER_HOSTNAME}",
    "https://hope-frontend-9jr0.onrender.com",
]

MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ["DATABASE_URL"],
        conn_max_age=600,
        ssl_require=True,
    )
}

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://hope-frontend-9jr0.onrender.com",
     "http://localhost:5173",
]
