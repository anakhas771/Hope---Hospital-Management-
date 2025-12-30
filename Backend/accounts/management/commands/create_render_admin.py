from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Create superuser if not exists (Render)"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        email = "admin@hope.com"
        password = "Admin@123"

        if User.objects.filter(email=email).exists():
            self.stdout.write("Admin already exists")
            return

        User.objects.create_superuser(
            email=email,
            password=password
        )

        self.stdout.write("Admin user created successfully")
