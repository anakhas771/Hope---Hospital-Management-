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
    Sends email using Resend API if API key exists.
    Falls back to SMTP.
    IMPORTANT: Never break the main request. Always return True.
    """
    from_email = from_email or getattr(settings, "DEFAULT_FROM_EMAIL", None)

    # ---------- TRY RESEND ----------
    if RESEND_API_KEY:
        try:
            payload = {
                "from": from_email,
                "to": recipient_list,
                "subject": subject,
                "html": html or text or "",
            }

            headers = {
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            }

            resp = requests.post(RESEND_API_URL, json=payload, headers=headers, timeout=10)

            if resp.status_code in (200, 202):
                return True
            else:
                logger.error("Resend API ERROR: %s %s", resp.status_code, resp.text)

        except Exception as e:
            logger.exception("Resend Exception: %s", e)

    # ---------- TRY DJANGO SMTP ----------
    try:
        django_send_mail(
            subject,
            text or "",
            from_email,
            recipient_list,
            fail_silently=True,  # VERY IMPORTANT → NEVER break signup
        )
    except Exception as e:
        logger.error("SMTP email failed: %s", e)

    # ALWAYS return True so signup does not break
    return True
