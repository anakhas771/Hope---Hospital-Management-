# backend/storage_backends.py

import requests
from django.core.files.storage import Storage
from django.conf import settings
from django.utils.deconstruct import deconstructible

@deconstructible
class SupabaseStorage(Storage):
    def _save(self, name, content):
        file_bytes = content.read()

        upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_BUCKET}/{name}"

        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/octet-stream",
        }

        res = requests.post(upload_url, data=file_bytes, headers=headers)

        if res.status_code not in (200, 201):
            raise Exception(f"Supabase Upload Failed: {res.status_code} - {res.text}")

        return name

    def url(self, name):
        return f"{settings.SUPABASE_PUBLIC_URL}/{name}"
