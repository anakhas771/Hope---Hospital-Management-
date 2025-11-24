from rest_framework import serializers
from .models import User, Department, Doctor, Appointment
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from django.contrib.auth import authenticate
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings


# -------------------- USER SERIALIZER --------------------
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    last_login = serializers.DateTimeField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)

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

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


# -------------------- REGISTER SERIALIZER --------------------
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Email already exists")]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    full_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("email", "password", "confirm_password", "full_name")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop("full_name")
        validated_data.pop("confirm_password")

        name_parts = full_name.strip().split(" ")
        first_name = name_parts[0]
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=first_name,
            last_name=last_name,
            is_active=True,
            is_verified=False  # Set False if email verification is implemented
        )
        return user


# -------------------- LOGIN SERIALIZER --------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = User.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not user.check_password(password):
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
        # Automatically assign logged-in user as patient
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

        # Generate a reset token
        token = get_random_string(64)

        # Save token in user model (ensure reset_token field exists)
        user.reset_token = token
        user.save()

        # Build reset link
        reset_link = f"{settings.FRONTEND_URL}/change-password/{token}"


        # Send email
        send_mail(
            subject="Reset Your Hospital Password",
            message=f"Hi {user.first_name},\n\nClick the link to reset your password:\n{reset_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return token


class ChangePasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password], style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        if not User.objects.filter(reset_token=attrs['token']).exists():
            raise serializers.ValidationError("Invalid or expired token")
        return attrs

    def save(self):
        token = self.validated_data['token']
        user = User.objects.get(reset_token=token)
        user.set_password(self.validated_data['new_password'])
        user.reset_token = None  # clear token after use
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
