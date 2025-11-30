import uuid
from django.core.files.storage import Storage
from supabase import create_client
from django.conf import settings

class SupabaseStorage(Storage):
    def __init__(self):
        self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        self.bucket = settings.SUPABASE_BUCKET

    def _save(self, name, content):
        filename = f"doctors/{uuid.uuid4()}_{name.split('/')[-1]}"
        data = content.read()

        self.client.storage.from_(self.bucket).upload(
            path=filename,
            file=data,
            file_options={"content-type": "image/jpeg"},
        )

        return filename

    def url(self, name):
        return self.client.storage.from_(self.bucket).get_public_url(name)

    def exists(self, name):
        return False
