#accounts/management/commands/upload_render_images.py
import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from accounts.models import Doctor
from supabase import create_client, Client

class Command(BaseCommand):
    help = "Upload doctor images from local media/doctors/ to Supabase and update Render DB"

    def handle(self, *args, **kwargs):
        supabase_url = settings.SUPABASE_URL
        supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY
        supabase_bucket = settings.SUPABASE_BUCKET

        supabase: Client = create_client(supabase_url, supabase_key)

        media_path = os.path.join(settings.BASE_DIR, "media", "doctors")
        if not os.path.isdir(media_path):
            self.stdout.write(self.style.ERROR(f"Directory not found: {media_path}"))
            return

        doctors = Doctor.objects.all()
        self.stdout.write(self.style.WARNING(f"Found {doctors.count()} doctors in Render DB."))

        uploaded = 0
        missing = 0

        for doctor in doctors:
            img_name = f"{doctor.name.replace(' ', '_').lower()}.jpg"
            local_path = os.path.join(media_path, img_name)

            if not os.path.exists(local_path):
                self.stdout.write(f"No local image for {doctor.name}")
                missing += 1
                continue

            try:
                with open(local_path, "rb") as file:
                    supabase.storage.from_(supabase_bucket).upload(
                        path=f"doctors/{img_name}",
                        file=file,
                        file_options={"content-type": "image/jpeg"},
                        upsert=True
                    )

                public_url = f"{supabase_url}/storage/v1/object/public/{supabase_bucket}/doctors/{img_name}"

                doctor.profile_image.name = f"doctors/{img_name}"
                doctor.save()


                self.stdout.write(self.style.SUCCESS(f"Uploaded -> {doctor.name}"))
                uploaded += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error uploading {doctor.name}: {e}"))

        self.stdout.write("\n--- SUMMARY ---")
        self.stdout.write(f"Uploaded: {uploaded}")
        self.stdout.write(f"Missing: {missing}")
        self.stdout.write(self.style.SUCCESS("Done."))
