# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from .models import User, Department, Doctor, Appointment


# -------------------- CUSTOM FORMS --------------------

class CustomUserCreationForm(forms.ModelForm):
    """Form used in the admin to create new users"""
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirm Password", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "is_staff", "is_active", "is_doctor", "is_patient")

    def clean_password2(self):
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Passwords do not match")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class CustomUserChangeForm(forms.ModelForm):
    """Form used in admin to update existing users"""
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "is_doctor",
            "is_patient",
            "groups",
            "user_permissions",
        )

    def clean_password(self):
        return self.initial["password"]


# -------------------- CUSTOM USER ADMIN --------------------

class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_superuser",
        "is_active",
        "is_doctor",
        "is_patient",
    )
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    list_filter = ("is_staff", "is_superuser", "is_active", "is_doctor", "is_patient")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "is_doctor", "is_patient", "groups", "user_permissions")},
        ),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email",
                "first_name",
                "last_name",
                "password1",
                "password2",
                "is_active",
                "is_staff",
                "is_doctor",
                "is_patient",
            ),
        }),
    )


# -------------------- REGISTER MODELS --------------------

admin.site.register(User, UserAdmin)
admin.site.register(Department)
admin.site.register(Doctor)
admin.site.register(Appointment)
