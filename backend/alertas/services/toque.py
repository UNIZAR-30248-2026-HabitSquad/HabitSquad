import json
from collections.abc import Callable
from typing import Any

from django.db import IntegrityError, transaction
from django.utils import timezone
from pywebpush import WebPushException, webpush

from alertas.models import SuscripcionPush, Toque
from alertas.services.push import _vapid_listo
from escuadrones.models import Escuadron, Membresia
from habitos.models import HabitoDiario, RegistroDiario

WebPushSender = Callable[..., Any]


class ToqueError(Exception):
    """Error esperado al validar o entregar un toque interpersonal."""


class ToqueDuplicadoError(ToqueError):
    """El destinatario ya recibió un toque en la fecha local actual."""


class SuscripcionToqueNoDisponibleError(ToqueError):
    """El destinatario no tiene una suscripción Web Push utilizable."""


def _destinatario_pendiente(*, escuadron_id: int, destinatario_id: int) -> bool:
    habito = HabitoDiario.objects.filter(
        membresia__escuadron_id=escuadron_id,
        membresia__usuario_id=destinatario_id,
    ).first()
    if habito is None:
        return False
    registro = RegistroDiario.objects.filter(
        habito=habito,
        fecha=timezone.localdate(),
    ).first()
    return registro is None or registro.estado == RegistroDiario.Estado.PENDIENTE


def _payload_toque(toque: Toque) -> str:
    return json.dumps(
        {
            "title": f"Toque de {toque.remitente.nickname}",
            "body": toque.mensaje,
        },
        ensure_ascii=False,
    )


def enviar_toque(
    *,
    escuadron: Escuadron,
    remitente,
    destinatario_id: int,
    mensaje: str,
    webpush_fn: WebPushSender = webpush,
) -> Toque:
    """Registra y envía un toque, con máximo uno diario por destinatario."""
    if remitente.pk == destinatario_id:
        raise ToqueError("No puedes enviarte un toque a ti mismo.")
    if not Membresia.objects.filter(
        escuadron=escuadron,
        usuario_id=destinatario_id,
    ).exists():
        raise ToqueError("El destinatario no pertenece a este escuadrón.")
    if not _destinatario_pendiente(
        escuadron_id=escuadron.pk,
        destinatario_id=destinatario_id,
    ):
        raise ToqueError("El destinatario no tiene una tarea pendiente hoy.")

    suscripciones = list(SuscripcionPush.objects.filter(usuario_id=destinatario_id))
    vapid = _vapid_listo()
    if not suscripciones or vapid is None:
        raise SuscripcionToqueNoDisponibleError(
            "No ha sido posible enviar la notificación por falta de permisos "
            "del usuario."
        )

    private_key, claims = vapid
    try:
        with transaction.atomic():
            toque = Toque.objects.create(
                escuadron=escuadron,
                remitente=remitente,
                destinatario_id=destinatario_id,
                fecha=timezone.localdate(),
                mensaje=mensaje,
            )
            payload = _payload_toque(toque)
            enviados = 0
            for suscripcion in suscripciones:
                try:
                    webpush_fn(
                        subscription_info={
                            "endpoint": suscripcion.endpoint,
                            "keys": {
                                "p256dh": suscripcion.p256dh,
                                "auth": suscripcion.auth,
                            },
                        },
                        data=payload,
                        vapid_private_key=private_key,
                        vapid_claims=claims,
                    )
                except WebPushException:
                    continue
                enviados += 1
            if not enviados:
                raise SuscripcionToqueNoDisponibleError(
                    "No ha sido posible enviar la notificación por falta de "
                    "permisos del usuario."
                )
    except IntegrityError as error:
        raise ToqueDuplicadoError(
            "El destinatario ya ha recibido un toque hoy."
        ) from error

    return toque
