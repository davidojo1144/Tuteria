import json
import uuid
import time
import hmac
import hashlib
import requests
from django.conf import settings
from django.http import JsonResponse

def _get_env():
    if hasattr(settings, "ENVIRONMENT") and settings.ENVIRONMENT:
        return settings.ENVIRONMENT
    return "staging" if getattr(settings, "DEBUG", False) else "production"

def _endpoint_for_env(env):
    base = settings.AUTOMATION_WORKFLOW_BASE_URL.rstrip("/")
    routes = getattr(settings, "AUTOMATION_WORKFLOW_ROUTES", {"production": "/api/workflows/send-mail", "staging": "/api/workflows/send-mail"})
    route = routes.get(env, routes["production"])
    return f"{base}{route}"

def _headers(payload, env):
    headers = {
        "Authorization": f"Bearer {settings.AUTOMATION_WORKFLOW_API_KEY}",
        "Content-Type": "application/json",
        "X-Env": env,
        "Idempotency-Key": uuid.uuid4().hex,
    }
    secret = getattr(settings, "AUTOMATION_WORKFLOW_WEBHOOK_SECRET", None)
    if secret:
        body = json.dumps(payload, separators=(",", ":"))
        headers["X-Signature"] = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()
    return headers

def post_to_workflow_service(path, payload, env=None, timeout=10, retries=2):
    env = env or _get_env()
    base = getattr(settings, "AUTOMATION_WORKFLOW_BASE_URL", "") or ""
    api_key = getattr(settings, "AUTOMATION_WORKFLOW_API_KEY", "") or ""
    if (not base) or ("workflow.example.com" in base) or (not api_key):
        echo = {
            "template": payload.get("template"),
            "to": payload.get("to"),
            "from": payload.get("from"),
            "context": payload.get("context"),
            "recipient": payload.get("context", {}).get("recipient") or payload.get("to"),
            "environment": env,
        }
        return {"ok": True, "queued": True, "environment": env, "id": uuid.uuid4().hex, "echo": echo}
    url = _endpoint_for_env(env)
    if path:
        url = f"{url.rstrip('/')}/{path.lstrip('/')}"
    backoff = 0.5
    for attempt in range(retries + 1):
        try:
            res = requests.post(
                url,
                json={
                    "template": payload.get("template"),
                    "to": payload.get("to"),
                    "from": payload.get("from"),
                    "context": payload.get("context"),
                    "recipient": payload.get("context", {}).get("recipient") or payload.get("to"),
                    "environment": env,
                },
                headers=_headers(payload, env),
                timeout=timeout,
            )
            if 200 <= res.status_code < 300:
                return res.json()
            if res.status_code in (429, 500, 502, 503, 504) and attempt < retries:
                time.sleep(backoff)
                backoff *= 2
                continue
            return {"ok": False, "status": res.status_code, "error": "workflow_failed", "detail": res.text}
        except requests.RequestException as e:
            if attempt < retries:
                time.sleep(backoff)
                backoff *= 2
                continue
            return {"ok": False, "status": None, "error": "network_error", "detail": str(e)}

def send_referral_followup_email(user, lead, currency, referral_amount, env=None):
    payload = {
        "to": user.email,
        "from": "Medbuddy <info@medbuddyafrica.com>",
        "context": {
            "user_first_name": (user.name or "").split(" ")[0],
            "referred_user_name": lead.user.name,
            "course_name": lead.course.name,
            "currency": currency,
            "referral_value": referral_amount,
            "referral_tracking_page_url": f"{settings.WEBSITE_URL}/app/referrals",
            "recipient": user.email,
        },
        "template": "medbuddy_referral_followup",
    }
    return post_to_workflow_service("send-mail", payload, env=env)
