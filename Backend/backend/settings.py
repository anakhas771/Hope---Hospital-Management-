# backend/settings.py
import os
from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------- SECURITY --------------------
SECRET_KEY = config("DJANGO_SECRET_KEY", default="unsafe-dev-key")
DEBUG = config("DEBUG", default=True, cast=bool)

# In development allow all hosts; change in production via deployment_settings.py
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="*", cast=lambda v: [h.strip() for h in v.split(",")])

# -------------------- APPS --------------------
INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",

    # Local apps
    "accounts",
]

# -------------------- MIDDLEWARE --------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # works in dev too
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    }
]

WSGI_APPLICATION = "backend.wsgi.application"

# -------------------- LOCAL DATABASE --------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="Hopedb"),
        "USER": config("DB_USER", default="postgres"),
        "PASSWORD": config("DB_PASSWORD", default="1234"),
        "HOST": config("DB_HOST", default="127.0.0.1"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

# -------------------- AUTH --------------------
AUTH_USER_MODEL = "accounts.User"

# -------------------- STATIC & MEDIA --------------------
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]  # optional for dev

# -------------------- CORS --------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://hope-frontend-9jr0.onrender.com",
]
CORS_ALLOW_CREDENTIALS = True

# -------------------- REST FRAMEWORK --------------------
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}

# -------------------- JWT --------------------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=config("ACCESS_TOKEN_LIFETIME_MINUTES", default=30, cast=int)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=config("REFRESH_TOKEN_LIFETIME_DAYS", default=7, cast=int)),
}

# -------------------- EMAIL (disabled by default) --------------------
# If you later want to enable email, uncomment and set env vars in production only
# EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_HOST = "smtp.gmail.com"
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = config("EMAIL_USER", default="")
# EMAIL_HOST_PASSWORD = config("EMAIL_PASS", default="")
# DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default=EMAIL_HOST_USER)

# -------------------- FRONTEND URL --------------------
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:5173")

# -------------------- LOGGING --------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {"handlers": ["console"], "level": "WARNING"},
}

# -------------------- Import production overrides when running on Render or when explicitly requested
if os.environ.get("DJANGO_SETTINGS_MODULE") == "backend.deployment_settings" or os.environ.get("RENDER"):
    # do not circular-import; deployment_settings.py will import this file as base
    pass



# settings.py (near the end, after MEDIA settings)
SUPABASE_URL = config("SUPABASE_URL", default=None)
SUPABASE_SERVICE_ROLE_KEY = config("SUPABASE_SERVICE_ROLE_KEY", default=None)
SUPABASE_BUCKET = config("SUPABASE_BUCKET", default="media")

# Make Django use our custom storage backend for uploaded files
DEFAULT_FILE_STORAGE = "backend.storage_backends.SupabaseMediaStorage"

# settings.py
BACKEND_BASE_URL = "https://hope-backend-mvos.onrender.com"   # <-- VERY IMPORTANT
