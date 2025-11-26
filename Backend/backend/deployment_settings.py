import os
import dj_database_url
from .settings import *

# -------------------- SECURITY --------------------
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

# -------------------- FIX MIDDLEWARE ORDER --------------------
MIDDLEWARE.insert(0, "corsheaders.middleware.CorsMiddleware")
MIDDLEWARE.insert(1, "django.middleware.security.SecurityMiddleware")
MIDDLEWARE.insert(2, "whitenoise.middleware.WhiteNoiseMiddleware")

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# -------------------- RENDER DATABASE --------------------
DATABASES = {
    "default": dj_database_url.config(
        default=os.environ["DATABASE_URL"],
        conn_max_age=600,
        ssl_require=True,
    )
}

# -------------------- CORS --------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://hope-frontend-9jr0.onrender.com",
]
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken", "Authorization"]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

FRONTEND_URL = "https://hope-frontend-9jr0.onrender.com"

RESEND_API_KEY = ""