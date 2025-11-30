# backend/storage_backends.py

import base64
import requests
from django.core.files.storage import Storage
from django.conf import settings
from django.utils.deconstruct import deconstructible

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY
SUPABASE_BUCKET = settings.SUPABASE_BUCKET
SUPABASE_STORAGE_URL = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}"

@deconstructible
class SupabaseStorage(Storage):
    def _save(self, name, content):
        file_bytes = content.read()

        url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{name}"

        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/octet-stream"
        }

        res = requests.post(url, data=file_bytes, headers=headers)

        if res.status_code not in (200, 201):
            raise Exception(f"Upload failed: {res.text}")

        return name

    def url(self, name):
        return f"{SUPABASE_STORAGE_URL}/{name}"
