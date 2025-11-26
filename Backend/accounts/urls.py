# accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
RegisterView,
LoginView,
DepartmentViewSet,
DoctorViewSet,
AppointmentViewSet,
UserViewSet,
ChangePasswordView,
admin_stats,
AdminLoginView,
reset_password
)

# Router for viewsets
router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"departments", DepartmentViewSet)
router.register(r"doctors", DoctorViewSet)
router.register(r"appointments", AppointmentViewSet)

urlpatterns = [
    # Authentication
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("reset-password/", reset_password, name="reset-password"),

    # Admin stats
    path("admin/stats/", admin_stats, name="admin-stats"),
    path("auth/admin-login/", AdminLoginView.as_view(), name="admin-login"),

    # Include all router paths
    path("", include(router.urls)),
]
