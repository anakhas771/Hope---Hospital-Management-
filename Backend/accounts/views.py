# accounts/views.py
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count, Sum
from django.utils.timezone import now
from datetime import timedelta

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Department, Doctor, Appointment
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ChangePasswordSerializer,
    DepartmentSerializer, DoctorSerializer, AppointmentSerializer,
    AdminStatsSerializer
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
        return Response({"message": "Registration successful"}, status=201)


# -------------------- LOGIN --------------------
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful",
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=200)


# -------------------- RESET PASSWORD --------------------
@api_view(["POST"])
def reset_password(request):
    return Response(
        {"detail": "Password reset via email is disabled."},
        status=status.HTTP_400_BAD_REQUEST,
    )

# -------------------- CHANGE PASSWORD --------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response({"success": "Password changed successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------- DEPARTMENTS --------------------
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsStaffOrSuperuser]


# -------------------- DOCTORS --------------------
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        department_name = self.request.query_params.get("department")

        if department_name:
            queryset = queryset.filter(department__name__iexact=department_name)

        return queryset


# -------------------- APPOINTMENTS --------------------
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by("-created_at")
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Appointment.objects.all()
        return Appointment.objects.filter(patient=user)

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
            return Response({"error": "Missing required fields"}, status=400)

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

        return Response(AppointmentSerializer(appointment).data, status=201)


# -------------------- ADMIN STATS --------------------
@api_view(["GET"])
@permission_classes([IsStaffOrSuperuser])
def admin_stats(request):
    total_users = User.objects.count()
    total_doctors = Doctor.objects.count()
    total_patients = User.objects.filter(is_patient=True).count()
    total_appointments = Appointment.objects.count()

    # Revenue last 30 days
    thirty_days_ago = now() - timedelta(days=30)
    revenue_30d = Appointment.objects.filter(
        status="paid",
        created_at__gte=thirty_days_ago
    ).aggregate(s=Sum("amount"))["s"] or 0

    # Appointments by department
    appointments_by_department = list(
        Department.objects.annotate(appts=Count("doctor__appointments"))
        .order_by("-appts")[:6]
        .values("name", "appts")
    )

    # Revenue for last 12 months
    monthly = []
    start = (now().replace(day=1) - timedelta(days=330)).replace(day=1)
    current = start

    for _ in range(12):
        next_month = (current.replace(day=28) + timedelta(days=4)).replace(day=1)
        rev = Appointment.objects.filter(
            status="paid",
            created_at__gte=current,
            created_at__lt=next_month
        ).aggregate(s=Sum("amount"))["s"] or 0

        monthly.append({
            "month": current.strftime("%b %Y"),
            "revenue": float(rev)
        })

        current = next_month

    recent_appointments = list(
        Appointment.objects.select_related("doctor", "patient")
        .order_by("-created_at")[:5]
        .values("doctor__name", "patient__email", "date_time", "status", "amount")
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
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"]
        )

        if not user:
            return Response({"error": "Invalid credentials"}, status=401)

        if not (user.is_staff or user.is_superuser):
            return Response({"error": "Not authorized as admin"}, status=403)

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Admin login successful",
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=200)
