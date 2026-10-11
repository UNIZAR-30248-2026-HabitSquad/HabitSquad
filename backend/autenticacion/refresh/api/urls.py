from django.urls import path

from .views import RefreshTokenView

urlpatterns = [
    path("auth/token/refresh/", RefreshTokenView.as_view(), name="refresh"),
]
