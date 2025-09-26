# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

# Redirect root URL to frontend
def home_redirect(request):
    if settings.DEBUG:
        # Development: redirect to React dev server
        return redirect("http://localhost:5173/")
    else:
        # Production: redirect to deployed frontend
        return redirect("https://yourfrontenddomain.com/")  # Replace with actual URL

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),  # API endpoints
    path("accounts/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", home_redirect),  # Root redirect
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
