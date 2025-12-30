# accounts/management/commands/sync_supabase_images.py
from django.core.management.base import BaseCommand
from accounts.models import Doctor

class Command(BaseCommand):
    help = "Set profile_image field for doctors using existing Supabase images"

    def handle(self, *args, **kwargs):
        updated = 0
        for doctor in Doctor.objects.all():
            # Construct the path based on your naming convention in Supabase
            file_name = doctor.name.replace(" ", "_").lower() + ".jpg"
            doctor.profile_image.name = f"doctors/{file_name}"
            doctor.save()
            updated += 1
            self.stdout.write(self.style.SUCCESS(f"Updated {doctor.name}"))

        self.stdout.write(self.style.SUCCESS(f"✅ Total doctors updated: {updated}"))
