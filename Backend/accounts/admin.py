from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.utils.html import format_html
from .models import User, Department, Doctor, Appointment

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("name", "department", "profile_image_tag")

    def profile_image_tag(self, obj):
        if obj.profile_image:
            return format_html('<img src="{}" width="50" />', obj.profile_image.url)
        return "-"
    profile_image_tag.short_description = "Profile Image"

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name")


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = (
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "is_patient",
            "is_doctor",
        )


class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

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

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name")}),
        ("Permissions", {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "is_doctor",
                "is_patient",
                "groups",
                "user_permissions",
            )
        }),
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
                "is_staff",
                "is_active",
                "is_doctor",
                "is_patient",
            ),
        }),
    )


admin.site.register(User, UserAdmin)
admin.site.register(Department)
admin.site.register(Appointment)
