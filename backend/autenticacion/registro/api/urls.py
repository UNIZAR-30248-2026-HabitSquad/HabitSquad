from django.urls import path

from .views import UserRegistrationView

urlpatterns = [
    path("auth/register/", UserRegistrationView.as_view(), name="register"),
]
