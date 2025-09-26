# accounts/permissions.py
from rest_framework.permissions import BasePermission


class IsStaffOrSuperuser(BasePermission):
    """
    Allows access only to staff or superuser accounts.
    """
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))


class IsDoctor(BasePermission):
    """
    Allows access only to doctor accounts.
    """
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_doctor)


class IsPatient(BasePermission):
    """
    Allows access only to patient accounts.
    """
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_patient)
