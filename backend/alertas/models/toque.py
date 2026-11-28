from typing import ClassVar

from django.conf import settings
from django.db import models

from escuadrones.models import Escuadron


class Toque(models.Model):
    """Toque diario enviado por un miembro a otro miembro pendiente."""

    escuadron = models.ForeignKey(
        Escuadron,
        on_delete=models.CASCADE,
        related_name="toques",
    )
    remitente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="toques_enviados",
    )
    destinatario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="toques_recibidos",
    )
    fecha = models.DateField()
    mensaje = models.TextField()
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "toque interpersonal"
        verbose_name_plural = "toques interpersonales"
        constraints: ClassVar[list] = [
            models.UniqueConstraint(
                fields=("destinatario", "fecha"),
                name="unique_toque_destinatario_fecha",
            ),
        ]

    def __str__(self):
        return f"{self.remitente_id} → {self.destinatario_id} · {self.fecha}"
