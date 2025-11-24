"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application

# IMPORTANT:
# When running on Render, environment variable
# DJANGO_SETTINGS_MODULE = "backend.deployment_settings"
# will override this automatically.
#
# But we still set a safe default for local dev:
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

application = get_wsgi_application()
if os.environ.get("RENDER") == "1":
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()

        if not User.objects.filter(email="admin@hope.com").exists():
            User.objects.create_superuser(
                email="admin@hope.com",
                first_name="Admin",
                last_name="User",
                password="Admin@123"
            )

            print("Superuser created successfully on Render!")
    except Exception as e:
        print("SUPERUSER ERROR:", e)