
#storage_backend.py
import io
import uuid
from django.core.files.storage import Storage
from django.conf import settings
from supabase import create_client, Client


class SupabaseMediaStorage(Storage):
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.bucket = settings.SUPABASE_BUCKET

    def _save(self, name, content):
        ext = name.split('.')[-1]
        new_name = f"doctors/{uuid.uuid4()}.{ext}"

        file_bytes = content.read()

        self.supabase.storage \
            .from_(self.bucket) \
            .upload(new_name, file_bytes, {
                "content-type": content.content_type
            })

        return new_name

    def url(self, name):
        signed_url = self.supabase.storage \
            .from_(self.bucket) \
            .get_public_url(name)

        return signed_url

    def exists(self, name):
        return False  # Always upload new file
