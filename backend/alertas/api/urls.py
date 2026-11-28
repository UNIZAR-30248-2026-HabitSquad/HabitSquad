from django.urls import path

from .toques import ToqueView
from .views import SuscripcionView, VapidPublicKeyView

app_name = "alertas"

urlpatterns = [
    path(
        "alertas/vapid-public-key/",
        VapidPublicKeyView.as_view(),
        name="vapid-public-key",
    ),
    path(
        "alertas/suscripcion/",
        SuscripcionView.as_view(),
        name="suscripcion",
    ),
    path(
        "escuadrones/<int:escuadron_id>/toques/",
        ToqueView.as_view(),
        name="enviar-toque",
    ),
]
