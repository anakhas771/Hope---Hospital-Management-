# backend/storage_backends.py
import os
import requests
from urllib.parse import quote
from django.core.files.storage import Storage
from django.conf import settings
from django.core.files.base import ContentFile, File

SUPABASE_URL = getattr(settings, "SUPABASE_URL", None)
SUPABASE_SERVICE_ROLE_KEY = getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", None)
SUPABASE_BUCKET = getattr(settings, "SUPABASE_BUCKET", None)

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY or not SUPABASE_BUCKET:
    # fail early in dev if misconfigured
    # don't raise in import time on all environments — optional
    pass


class SupabaseMediaStorage(Storage):
    """
    Minimal Django Storage implementation for Supabase Storage.
    - uploads via POST /storage/v1/object/{bucket}
    - public URL: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
    """

    def _open(self, name, mode='rb'):
        # we don't implement reading through this storage (not needed for typical use)
        raise NotImplementedError("SupabaseMediaStorage does not support _open")

    def _save(self, name, content):
        """
        Upload file to Supabase bucket. 'name' is the path (e.g. doctors/doctor1.jpg).
        'content' is a Django File object.
        """
        # Normalize name and ensure no leading slash
        name = name.lstrip("/")

        upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{quote(name)}"

        # Many Supabase examples use 'file' form field — use multipart/form-data
        # content may be either UploadedFile or File subclass with .read()
        # determine content-type if present
        content_type = getattr(content, "content_type", "application/octet-stream")

        # Ensure file content is seeked to start
        try:
            content.seek(0)
        except Exception:
            pass

        files = {
            "file": (os.path.basename(name), content, content_type)
        }

        headers = {
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            # no Content-Type header here; requests will set multipart boundary
            "x-upsert": "true",  # overwrite if exists
        }

        resp = requests.post(upload_url, headers=headers, files=files, timeout=30)

        if resp.status_code not in (200, 201):
            # raise a helpful error with backend response
            raise Exception(f"Supabase upload failed ({resp.status_code}): {resp.text}")

        # return the name (Django expects the path in storage)
        return name

    def exists(self, name):
        # Optionally check if file exists on Supabase: HEAD request to public URL
        name = name.lstrip("/")
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{quote(name)}"
        r = requests.head(public_url, timeout=10)
        return r.status_code == 200

    def url(self, name):
        """Return public URL for the saved file."""
        name = name.lstrip("/")
        return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{quote(name)}"

    def size(self, name):
        # Could call /object to get metadata but keep simple: return None
        return None

    def delete(self, name):
        """Delete object from bucket."""
        name = name.lstrip("/")
        delete_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{quote(name)}"
        headers = {"Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"}
        r = requests.delete(delete_url, headers=headers, timeout=10)
        if r.status_code not in (200, 204):
            # for idempotency, don't raise on 404
            if r.status_code != 404:
                raise Exception(f"Supabase delete failed ({r.status_code}): {r.text}")
        return None
