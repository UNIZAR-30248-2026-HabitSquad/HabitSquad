from django.urls import path

from .views import EscuadronCreateView

urlpatterns = [
    path("escuadrones/", EscuadronCreateView.as_view(), name="crear-escuadron"),
]
