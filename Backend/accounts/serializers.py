from rest_framework import serializers
from .models import User, Department, Doctor, Appointment
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from django.utils.crypto import get_random_string
from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from backend.utils.email_sender import send_email


# -------------------- USER SERIALIZER --------------------
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "is_active",
            "is_verified",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["date_joined", "last_login"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


# -------------------- REGISTER SERIALIZER --------------------
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[
        UniqueValidator(queryset=User.objects.all(), message="Email already exists")
    ])
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()

    class Meta:
        model = User
        fields = ("email", "password", "confirm_password", "full_name")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})

        if len(attrs["password"]) < 6:
            raise serializers.ValidationError({"password": "Password must be at least 6 characters"})

        return attrs

    def create(self, data):
        full = data.pop("full_name")
        data.pop("confirm_password")
        first, *rest = full.split()
        last = " ".join(rest)

        return User.objects.create_user(
            email=data["email"],
            first_name=first,
            last_name=last,
            password=data["password"],
            is_active=True,
            is_verified=False
        )



# -------------------- LOGIN SERIALIZER --------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = User.objects.filter(email=email).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_verified:
            raise serializers.ValidationError("Email is not verified")

        attrs["user"] = user
        return attrs


# -------------------- DEPARTMENT SERIALIZER --------------------
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


# -------------------- DOCTOR SERIALIZER --------------------
class DoctorSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Doctor
        fields = [
            "id",
            "name",
            "specialization",
            "education",
            "experience",
            "availability",
            "rating",
            "patients_count",
            "profile_image",
            "department",
        ]


# -------------------- APPOINTMENT SERIALIZER --------------------
class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(), source="doctor", write_only=True
    )
    patient_email = serializers.EmailField(source="patient.email", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "doctor_id",
            "patient",
            "patient_email",
            "date_time",
            "notes",
            "status",
            "payment_id",
            "payment_status",
            "payer_email",
            "amount",
            "created_at",
        ]
        read_only_fields = [
            "patient",
            "status",
            "payment_id",
            "payment_status",
            "payer_email",
            "amount",
            "created_at",
        ]

    def create(self, validated_data):
        validated_data["patient"] = self.context["request"].user
        return super().create(validated_data)


# -------------------- RESET PASSWORD SERIALIZER --------------------
class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email not found")
        return value

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)

        token = get_random_string(64)
        user.reset_token = token
        user.save()


        reset_link = f"{settings.FRONTEND_URL}/change-password/{token}"
        subject = "Reset Your Hospital Password"
        text = f"Hi {user.first_name},\n\nClick the link to reset your password:\n{reset_link}"
        html = f"<p>Hi {user.first_name},</p><p>Click the link to reset your password:</p><p><a href='{reset_link}'>{reset_link}</a></p>"

        sent = send_email(subject, [user.email], text=text, html=html, from_email=settings.DEFAULT_FROM_EMAIL)
        if not sent:
            # optional: log failure
            logger = logging.getLogger(__name__)
            logger.warning("Password reset email failed to send for %s", user.email)
        return token


# -------------------- CHANGE PASSWORD SERIALIZER --------------------
class ChangePasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")

        if not User.objects.filter(reset_token=attrs["token"]).exists():
            raise serializers.ValidationError("Invalid or expired token")

        if len(attrs["new_password"]) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters")

        return attrs

    def save(self):
        token = self.validated_data["token"]
        user = User.objects.get(reset_token=token)
        user.set_password(self.validated_data["new_password"])
        user.reset_token = None
        user.save()
        return user


# -------------------- ADMIN STATS SERIALIZER --------------------
class AdminStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_doctors = serializers.IntegerField()
    total_patients = serializers.IntegerField()
    total_appointments = serializers.IntegerField()
    revenue_30d = serializers.DecimalField(max_digits=12, decimal_places=2)
    appointments_by_department = serializers.ListField()
    last_12_months_revenue = serializers.ListField()
    recent_appointments = serializers.ListField()
