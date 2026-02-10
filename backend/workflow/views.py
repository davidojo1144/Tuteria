import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from .utils.workflow_email import post_to_workflow_service

@csrf_exempt
@require_POST
def workflow_send_mail(request):
    try:
        data = json.loads(request.body)
    except ValueError:
        return HttpResponseBadRequest("Invalid JSON")
    env = data.get("environment")
    result = post_to_workflow_service("send-mail", data, env=env)
    status = 200 if result.get("ok", True) else 400
    return JsonResponse(result, status=status)
