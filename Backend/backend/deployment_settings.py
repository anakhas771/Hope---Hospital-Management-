import os
import dj_database_url
from .settings import *

# ---- PRODUCTION MODE ----
DEBUG = False

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")

RENDER_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME")

ALLOWED_HOSTS = [
    RENDER_HOSTNAME,
    "localhost",
]

CSRF_TRUSTED_ORIGINS = [
    f"https://{RENDER_HOSTNAME}",
]

# ---- STATIC FILES (Whitenoise) ----
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ---- DATABASE ----
DATABASES = {
    "default": dj_database_url.config(
        default=os.environ["DATABASE_URL"],
        conn_max_age=600,
        ssl_require=True,
    )
}

# ---- CORS ----
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",")

# Disable allow all
CORS_ALLOW_ALL_ORIGINS = False


# AUTO CREATE SUPERUSER ON DEPLOY (REMOVE AFTER FIRST RUN)
from django.contrib.auth import get_user_model

User = get_user_model()
if not User.objects.filter(email="admin@hope.com").exists():
    User.objects.create_superuser(
        email="admin@hope.com",
        name="Admin",
        password="Admin@123"
    )
