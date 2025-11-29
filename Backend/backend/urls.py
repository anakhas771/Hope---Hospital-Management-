from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.urls import re_path
from django.views.static import serve
from rest_framework_simplejwt.views import TokenRefreshView


def backend_home(request):
    return JsonResponse({"message": "Backend is running successfully"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("accounts/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", backend_home),
]

# Serve media files in Render deployment
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
