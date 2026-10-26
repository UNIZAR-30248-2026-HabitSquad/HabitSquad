from django.urls import path

from .views import EscuadronJoinView

urlpatterns = [
    path("escuadrones/unirse/", EscuadronJoinView.as_view(), name="unirse-escuadron"),
]
