from rest_framework import serializers
from .models import User, Department, Doctor, Appointment
from rest_framework.validators import UniqueValidator


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
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["date_joined", "last_login"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


# -------------------- REGISTER SERIALIZER --------------------
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all(), message="Email already exists")]
    )
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

    def create(self, validated_data):
        full = validated_data.pop("full_name")
        validated_data.pop("confirm_password")

        # Split name safely
        parts = full.split()
        first = parts[0]
        last = " ".join(parts[1:]) if len(parts) > 1 else ""

        # Create user
        return User.objects.create_user(
            email=validated_data["email"],
            first_name=first,
            last_name=last,
            password=validated_data["password"],
            is_active=True,
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

        # Email-verification check removed

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
    """No email reset — now returns an error telling user this feature is disabled."""
    email = serializers.EmailField()

    def validate(self, attrs):
        raise serializers.ValidationError("Password reset via email is disabled.")



# -------------------- CHANGE PASSWORD SERIALIZER --------------------
class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")
        if len(attrs["new_password"]) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters")
        return attrs

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
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
