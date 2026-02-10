from django.contrib import admin
from django.urls import path
from workflow.views import workflow_send_mail

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/workflows/send-mail", workflow_send_mail),
]
