from datetime import timedelta, datetime
from django.db import models
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model, authenticate
from django.utils.timezone import now
from django.utils.crypto import get_random_string

from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Department, Doctor, Appointment, UserPasswordResetToken
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ChangePasswordSerializer,
    DepartmentSerializer, DoctorSerializer, AppointmentSerializer,
    AdminStatsSerializer,
)
from .permissions import IsStaffOrSuperuser

User = get_user_model()

# -------------------- REGISTER --------------------

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Registration successful"}, status=status.HTTP_21_CREATED if hasattr(status, 'HTTP_201_CREATED') else 201)


# -------------------- LOGIN --------------------

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful",
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)


# -------------------- CHANGE PASSWORD --------------------

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = self.get_object()
            new_password = serializer.validated_data.get("new_password")
            confirm_password = serializer.validated_data.get("confirm_password")

            if new_password != confirm_password:
                return Response({"detail": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
            if len(new_password) < 6:
                return Response({"detail": "Password must be at least 6 characters"}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({"detail": "Password changed successfully"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------- FORGOT PASSWORD --------------------

class ForgotPasswordAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        email = email.strip()
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "No user found with this email."}, status=status.HTTP_400_BAD_REQUEST)

        token = get_random_string(50)
        UserPasswordResetToken.objects.create(user=user, token=token)
        return Response({"reset_token": token, "message": "Password reset token generated successfully"}, status=status.HTTP_200_OK)


# -------------------- RESET PASSWORD USING TOKEN --------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get("email")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not email:
        return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

    email = email.strip()
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"detail": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

    user.set_password(new_password)
    user.save()

    return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)


# -------------------- DEPARTMENTS --------------------

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsStaffOrSuperuser()]


# -------------------- DOCTORS --------------------

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related("department").all()
    serializer_class = DoctorSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Doctor.objects.select_related("department").all()
        department_name = self.request.query_params.get("department")
        if department_name:
            department_name = department_name.strip()
            if department_name.isdigit():
                queryset = queryset.filter(department_id=int(department_name))
            else:
                queryset = queryset.filter(
                    models.Q(department__name__iexact=department_name) |
                    models.Q(specialization__icontains=department_name)
                )
        return queryset


# -------------------- APPOINTMENTS --------------------

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("doctor", "doctor__department", "patient").all().order_by("-created_at")
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Appointment.objects.select_related("doctor", "doctor__department", "patient").order_by("-created_at")
        if user.is_staff or user.is_superuser:
            return qs
        return qs.filter(patient=user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)

    @action(detail=False, methods=["post"], url_path="verify_payment")
    def verify_payment(self, request):
        user = request.user
        payment_id = request.data.get("payment_id")
        doctor_id = request.data.get("doctor_id")
        date_time = request.data.get("date_time")
        notes = request.data.get("notes", "")

        if not all([payment_id, doctor_id, date_time]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        doctor = get_object_or_404(Doctor, id=doctor_id)
        amount = getattr(doctor, "fee", 500)

        appointment = Appointment.objects.create(
            patient=user,
            doctor=doctor,
            date_time=date_time,
            notes=notes,
            status="paid",
            amount=amount,
            payment_id=payment_id
        )
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


# -------------------- ADMIN STATS --------------------

@api_view(["GET"])
@permission_classes([IsStaffOrSuperuser])
def admin_stats(request):
    total_users = User.objects.count()
    total_doctors = Doctor.objects.count()
    total_patients = User.objects.filter(is_patient=True).count()
    total_appointments = Appointment.objects.count()

    thirty_days_ago = now() - timedelta(days=30)
    revenue_30d = Appointment.objects.filter(status="paid", created_at__gte=thirty_days_ago).aggregate(s=Sum("amount"))["s"] or 0

    appointments_by_department = list(
        Department.objects.annotate(appts=Count("doctor__appointments")).order_by("-appts")[:6].values("name", "appts")
    )

    start = (now().replace(day=1) - timedelta(days=330)).replace(day=1)
    monthly_qs = (
        Appointment.objects.filter(status="paid", created_at__gte=start)
        .annotate(month_date=TruncMonth("created_at"))
        .values("month_date")
        .annotate(revenue=Sum("amount"))
        .order_by("month_date")
    )

    rev_dict = {}
    for item in monthly_qs:
        m_date = item.get("month_date")
        if not m_date:
            continue
        if isinstance(m_date, str):
            try:
                m_date = datetime.strptime(m_date[:10], "%Y-%m-%d")
            except Exception:
                continue
        try:
            m_key = m_date.strftime("%b %Y")
            rev_dict[m_key] = float(item["revenue"] or 0)
        except Exception:
            pass

    monthly = []
    current = start
    for _ in range(12):
        m_key = current.strftime("%b %Y")
        monthly.append({"month": m_key, "revenue": rev_dict.get(m_key, 0.0)})
        current = (current.replace(day=28) + timedelta(days=4)).replace(day=1)

    recent_appointments = list(
        Appointment.objects.select_related("doctor", "patient").order_by("-created_at")[:5].values("doctor__name", "patient__email", "date_time", "status", "amount")
    )

    payload = {
        "total_users": total_users,
        "total_doctors": total_doctors,
        "total_patients": total_patients,
        "total_appointments": total_appointments,
        "revenue_30d": revenue_30d,
        "appointments_by_department": appointments_by_department,
        "last_12_months_revenue": monthly,
        "recent_appointments": recent_appointments
    }
    serializer = AdminStatsSerializer(payload)
    return Response(serializer.data)


# -------------------- USER MANAGEMENT (ADMIN ONLY) --------------------

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


# -------------------- ADMIN LOGIN --------------------

class AdminLoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        email = email.strip()
        user = authenticate(request, email=email, password=password)

        if not user:
            return Response({"error": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_staff and not user.is_superuser:
            return Response({"error": "You are not an admin"}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": getattr(user, "full_name", f"{user.first_name} {user.last_name}".strip()),
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            }
        })