from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Count, Sum
from django.utils.timezone import now
from django.utils.crypto import get_random_string
from datetime import timedelta

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Department, Doctor, Appointment, UserPasswordResetToken
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
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data.get("user")
            if not user:
                return Response({"error": "Invalid credentials"}, status=401)

            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Login successful",
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


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
                return Response({"detail": "Passwords do not match"}, status=400)
            if len(new_password) < 6:
                return Response({"detail": "Password must be at least 6 characters"}, status=400)

            user.set_password(new_password)
            user.save()
            return Response({"detail": "Password changed successfully"}, status=200)

        return Response(serializer.errors, status=400)


# -------------------- FORGOT PASSWORD --------------------

class ForgotPasswordAPIView(APIView):
    permission_classes = [AllowAny]


    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "No user found with this email."}, status=400)

        token = get_random_string(50)
        UserPasswordResetToken.objects.create(user=user, token=token)
        return Response({"reset_token": token}, status=200)


# -------------------- RESET PASSWORD USING TOKEN --------------------

@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get("email")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not email:
        return Response({"detail": "Email is required."}, status=400)

    if new_password != confirm_password:
        return Response({"detail": "Passwords do not match."}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"detail": "User with this email does not exist."}, status=404)

    user.set_password(new_password)
    user.save()

    return Response({"detail": "Password reset successful."}, status=200)


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

   
    thirty_days_ago = now() - timedelta(days=30)
    revenue_30d = Appointment.objects.filter(status="paid", created_at__gte=thirty_days_ago).aggregate(s=Sum("amount"))["s"] or 0

    appointments_by_department = list(
        Department.objects.annotate(appts=Count("doctor__appointments")).order_by("-appts")[:6].values("name", "appts")
    )

    monthly = []
    start = (now().replace(day=1) - timedelta(days=330)).replace(day=1)
    current = start
    for _ in range(12):
        next_month = (current.replace(day=28) + timedelta(days=4)).replace(day=1)
        rev = Appointment.objects.filter(status="paid", created_at__gte=current, created_at__lt=next_month).aggregate(s=Sum("amount"))["s"] or 0
        monthly.append({"month": current.strftime("%b %Y"), "revenue": float(rev)})
        current = next_month

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
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # You can create a token if using DRF token auth
        # or just return user info
        return Response({
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }, status=status.HTTP_200_OK)