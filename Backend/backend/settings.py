# backend/settings.py
import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv

# -------------------- BASE DIR --------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------- SECURITY --------------------
SECRET_KEY = config("DJANGO_SECRET_KEY", default="unsafe-dev-key")
DEBUG = True  # Development mode
ALLOWED_HOSTS = ["*"]  # Accept all hosts in dev

# -------------------- APPLICATIONS --------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    # Your apps
    "accounts",
]
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -------------------- URLS --------------------
ROOT_URLCONF = "backend.urls"

# -------------------- TEMPLATES --------------------
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

# -------------------- DATABASE --------------------
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

# -------------------- PASSWORD VALIDATION --------------------
AUTH_PASSWORD_VALIDATORS = []

# -------------------- INTERNATIONALIZATION --------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_L10N = True
USE_TZ = True

# -------------------- STATIC & MEDIA --------------------
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
STATIC_ROOT = BASE_DIR / "staticfiles"


# -------------------- CUSTOM USER MODEL --------------------
AUTH_USER_MODEL = "accounts.User"

# -------------------- CORS --------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = []

# -------------------- REST FRAMEWORK --------------------
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}

# -------------------- SIMPLE JWT --------------------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# -------------------- EMAIL CONFIG --------------------
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config("EMAIL_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_PASS")
DEFAULT_FROM_EMAIL = "Hospital <hope@hospital.com>"
EMAIL_SUBJECT_PREFIX = "[Hospital] "

# -------------------- PAYPAL CONFIG --------------------
PAYPAL_CLIENT_ID = config("PAYPAL_CLIENT_ID", default="")
PAYPAL_CLIENT_SECRET = config("PAYPAL_CLIENT_SECRET", default="")
PAYPAL_MODE = "sandbox"

# -------------------- LOGGING --------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "DEBUG"},
}


# if running on Render, use deployment_settings
if os.environ.get("DJANGO_SETTINGS_MODULE") == "backend.deployment_settings" or os.environ.get("RENDER") == "1":
    try:
        from .deployment_settings import *   # noqa: F401,F403
    except Exception:
        pass

