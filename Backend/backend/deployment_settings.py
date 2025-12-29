# backend/deployment_settings.py
import os
from .settings import *  # import base settings

import dj_database_url

# -------------------- SECURITY OVERRIDES --------------------
DEBUG = False
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", SECRET_KEY)  # fallback to base, but on Render set env var

# Hostnames for Render
RENDER_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME")

ALLOWED_HOSTS = [
    host for host in [
        RENDER_HOSTNAME,
        "hope-backend-mvos.onrender.com",
        "localhost",
    ] if host
] or ["*"]  # if none set, fallback to * (not ideal — set RENDER_EXTERNAL_HOSTNAME)

# -------------------- CSRF / CORS TRUST --------------------
if RENDER_HOSTNAME:
    CSRF_TRUSTED_ORIGINS = [
        f"https://{RENDER_HOSTNAME}",
        "https://hope-frontend-9jr0.onrender.com",
    ]
else:
    CSRF_TRUSTED_ORIGINS = ["https://hope-frontend-9jr0.onrender.com"]

CORS_ALLOWED_ORIGINS = [
    "https://hope-frontend-9jr0.onrender.com",
]
CORS_ALLOW_CREDENTIALS = True

# -------------------- MIDDLEWARE (ensure whitenoise & cors are in correct order) --------------------
# Ensure cors + security + whitenoise are near the top
if "corsheaders.middleware.CorsMiddleware" not in MIDDLEWARE:
    MIDDLEWARE.insert(0, "corsheaders.middleware.CorsMiddleware")
if "django.middleware.security.SecurityMiddleware" not in MIDDLEWARE:
    MIDDLEWARE.insert(1, "django.middleware.security.SecurityMiddleware")
if "whitenoise.middleware.WhiteNoiseMiddleware" not in MIDDLEWARE:
    MIDDLEWARE.insert(2, "whitenoise.middleware.WhiteNoiseMiddleware")

# -------------------- STATICFILES STORAGE --------------------
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# -------------------- DATABASE (Render recommended) --------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        "HOST": os.environ.get("DB_HOST"),
        "PORT": os.environ.get("DB_PORT", "5432"),
        "CONN_MAX_AGE": int(os.environ.get("DB_CONN_MAX_AGE", 600)),
        "OPTIONS": {"sslmode": "require" if os.environ.get("DB_SSL_REQUIRE", "True") == "True" else "disable"},
    }
}


# -------------------- SECURITY PROXY --------------------
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# -------------------- FRONTEND URL --------------------
FRONTEND_URL = os.environ.get("FRONTEND_URL", FRONTEND_URL)

# -------------------- LOGGING (stream to console so Render captures it) --------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": os.environ.get("LOG_LEVEL", "ERROR")},
}

# -------------------- Optional: disable sending emails in production by default
# Uncomment and configure if you want to enable email sending in production only.
# EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
# EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = os.environ.get("EMAIL_USER", "")
# EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_PASS", "")
# DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)

DEFAULT_FILE_STORAGE = "backend.storage_backends.SupabaseStorage"
