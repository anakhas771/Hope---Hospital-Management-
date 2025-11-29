# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.views.static import serve
from django.urls import re_path

# Root URL returns a simple JSON response
def backend_home(request):
    return JsonResponse({"message": "Backend is running successfully"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),  # All API routes
    path("accounts/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Root path for backend
    path("", backend_home),
]

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]