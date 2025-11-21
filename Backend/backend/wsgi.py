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
