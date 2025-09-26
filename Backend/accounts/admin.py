# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from .models import User, Department, Doctor, Appointment


# -------------------- CUSTOM USER ADMIN --------------------
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "is_staff", "is_active")


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "is_staff", "is_active", "is_doctor", "is_patient")


class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ("email", "first_name", "last_name", "is_staff", "is_superuser", "is_active", "is_doctor", "is_patient")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    list_filter = ("is_staff", "is_superuser", "is_active", "is_doctor", "is_patient")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_doctor", "is_patient", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "password1", "password2", "is_staff", "is_active", "is_doctor", "is_patient"),
        }),
    )


# -------------------- REGISTER MODELS --------------------
admin.site.register(User, UserAdmin)
admin.site.register(Department)
admin.site.register(Doctor)
admin.site.register(Appointment)
