# backend/utils/email_sender.py
import logging
import os
import requests
from django.core.mail import send_mail as django_send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"
RESEND_API_KEY = getattr(settings, "RESEND_API_KEY", "") or os.environ.get("RESEND_API_KEY", "")


def send_email(subject: str, recipient_list: list, text: str = None, html: str = None, from_email: str = None):
    """
    Unified send function.
    If RESEND_API_KEY is present, send via Resend API.
    Otherwise fall back to Django's send_mail (SMTP).
    Returns True if call succeeded (or queued), False on failure.
    """
    from_email = from_email or getattr(settings, "DEFAULT_FROM_EMAIL", None)
    # --- Use Resend if key is present ---
    if RESEND_API_KEY:
        try:
            payload = {
                "from": from_email,
                "to": recipient_list,
                "subject": subject,
            }
            # prefer html if provided
            if html:
                payload["html"] = html
            elif text:
                payload["text"] = text
            else:
                payload["text"] = ""

            headers = {
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            }

            resp = requests.post(RESEND_API_URL, json=payload, headers=headers, timeout=10)
            if resp.status_code in (200, 202):
                return True
            else:
                logger.error("Resend API error: %s %s", resp.status_code, resp.text)
                # fall through to fallback (so we return False at end)
        except Exception as e:
            logger.exception("Resend send failed: %s", e)
            # continue to fallback

    # --- Fallback to Django SMTP (local dev) ---
    try:
        # django_send_mail returns number of recipients successfully sent to
        django_send_mail(
            subject,
            text or "",
            from_email,
            recipient_list,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.exception("Django SMTP send failed: %s", e)
        return False
