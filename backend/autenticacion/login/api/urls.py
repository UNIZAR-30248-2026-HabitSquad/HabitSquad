from django.urls import path

from .views import LoginView

urlpatterns = [
    path("auth/token/", LoginView.as_view(), name="token"),
]
