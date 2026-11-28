import json
from unittest.mock import MagicMock

import pytest
from django.db import IntegrityError, transaction
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from pywebpush import WebPushException
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from alertas.models import SuscripcionPush, Toque
from alertas.services import (
    SuscripcionToqueNoDisponibleError,
    ToqueDuplicadoError,
    ToqueError,
    enviar_toque,
)
from escuadrones.models import Escuadron, Membresia
from habitos.models import HabitoDiario, RegistroDiario
from usuarios.models import CustomUser

ENDPOINT = "https://fcm.googleapis.com/fcm/send/toque"
VAPID = {
    "VAPID_PUBLIC_KEY": "publica",
    "VAPID_PRIVATE_KEY": "privada",
    "VAPID_ADMIN_EMAIL": "ops@habitsquad.local",
}


@pytest.fixture
def remitente(db):
    return CustomUser.objects.create_user(
        email="remitente-toque@example.com",
        password="S0mething!Secure-497",
        nickname="Remitente",
    )


@pytest.fixture
def destinatario(db):
    return CustomUser.objects.create_user(
        email="destinatario-toque@example.com",
        password="S0mething!Secure-497",
        nickname="Destinatario",
    )


@pytest.fixture
def escuadron(remitente, destinatario):
    escuadron = Escuadron.objects.create(
        nombre="Toques",
        creador=remitente,
        codigo_invitacion="TOQUE1",
    )
    Membresia.objects.create(escuadron=escuadron, usuario=remitente)
    membresia_destinatario = Membresia.objects.create(
        escuadron=escuadron,
        usuario=destinatario,
    )
    HabitoDiario.objects.create(
        membresia=membresia_destinatario,
        opcion=HabitoDiario.Opcion.LEER,
    )
    return escuadron


@pytest.fixture
def suscripcion(destinatario):
    return SuscripcionPush.objects.create(
        usuario=destinatario,
        endpoint=ENDPOINT,
        p256dh="clave-p256dh",
        auth="clave-auth",
    )


@pytest.fixture
def api_client(remitente):
    client = APIClient()
    token = AccessToken.for_user(remitente)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture
def endpoint(escuadron):
    return reverse(
        "alertas:enviar-toque",
        kwargs={"escuadron_id": escuadron.pk},
    )


@pytest.fixture
def habilitar_vapid():
    with override_settings(**VAPID):
        yield


@pytest.mark.django_db
def test_enviar_toque_envia_payload_con_remitente_y_mensaje(
    escuadron,
    remitente,
    destinatario,
    suscripcion,
    habilitar_vapid,
):
    webpush = MagicMock()

    toque = enviar_toque(
        escuadron=escuadron,
        remitente=remitente,
        destinatario_id=destinatario.pk,
        mensaje="¡Ánimo!",
        webpush_fn=webpush,
    )

    assert toque.destinatario_id == destinatario.pk
    assert toque.fecha == timezone.localdate()
    assert Toque.objects.count() == 1
    webpush.assert_called_once()
    parametros = webpush.call_args.kwargs
    assert parametros["subscription_info"]["endpoint"] == suscripcion.endpoint
    assert json.loads(parametros["data"]) == {
        "title": "Toque de Remitente",
        "body": "¡Ánimo!",
    }
    assert parametros["vapid_private_key"] == "privada"
    assert parametros["vapid_claims"] == {"sub": "mailto:ops@habitsquad.local"}


@pytest.mark.django_db
def test_no_permite_autotoque(escuadron, remitente):
    with pytest.raises(ToqueError, match="No puedes enviarte"):
        enviar_toque(
            escuadron=escuadron,
            remitente=remitente,
            destinatario_id=remitente.pk,
            mensaje="¡Ánimo!",
            webpush_fn=MagicMock(),
        )


@pytest.mark.django_db
def test_no_permite_destinatario_ajeno_al_escuadron(
    escuadron,
    remitente,
    db,
):
    ajeno = CustomUser.objects.create_user(
        email="ajeno-toque@example.com",
        password="S0mething!Secure-497",
        nickname="Ajeno",
    )

    with pytest.raises(ToqueError, match="no pertenece"):
        enviar_toque(
            escuadron=escuadron,
            remitente=remitente,
            destinatario_id=ajeno.pk,
            mensaje="¡Ánimo!",
            webpush_fn=MagicMock(),
        )


@pytest.mark.django_db
def test_no_permite_destinatario_sin_habito(escuadron, remitente, db):
    sin_habito = CustomUser.objects.create_user(
        email="sin-habito-toque@example.com",
        password="S0mething!Secure-497",
        nickname="SinHabito",
    )
    Membresia.objects.create(escuadron=escuadron, usuario=sin_habito)

    with pytest.raises(ToqueError, match="tarea pendiente"):
        enviar_toque(
            escuadron=escuadron,
            remitente=remitente,
            destinatario_id=sin_habito.pk,
            mensaje="¡Ánimo!",
            webpush_fn=MagicMock(),
        )


@pytest.mark.parametrize(
    "estado",
    [RegistroDiario.Estado.CUMPLIDO, RegistroDiario.Estado.NO_CUMPLIDO],
)
@pytest.mark.django_db
def test_no_permite_destinatario_con_registro_cerrado(
    escuadron,
    remitente,
    destinatario,
    estado,
):
    habito = HabitoDiario.objects.get(
        membresia__escuadron=escuadron,
        membresia__usuario=destinatario,
    )
    RegistroDiario.objects.create(
        habito=habito,
        fecha=timezone.localdate(),
        cloudinary_public_id="foto/cerrada",
        estado=estado,
    )

    with pytest.raises(ToqueError, match="tarea pendiente"):
        enviar_toque(
            escuadron=escuadron,
            remitente=remitente,
            destinatario_id=destinatario.pk,
            mensaje="¡Ánimo!",
            webpush_fn=MagicMock(),
        )


@pytest.mark.django_db
def test_acepta_destinatario_con_registro_pendiente(
    escuadron,
    remitente,
    destinatario,
    suscripcion,
    habilitar_vapid,
):
    habito = HabitoDiario.objects.get(
        membresia__escuadron=escuadron,
        membresia__usuario=destinatario,
    )
    RegistroDiario.objects.create(
        habito=habito,
        fecha=timezone.localdate(),
        cloudinary_public_id="foto/pendiente",
        estado=RegistroDiario.Estado.PENDIENTE,
    )
    webpush = MagicMock()

    enviar_toque(
        escuadron=escuadron,
        remitente=remitente,
        destinatario_id=destinatario.pk,
        mensaje="¡Ánimo!",
        webpush_fn=webpush,
    )

    webpush.assert_called_once()


@pytest.mark.django_db
def test_rechaza_destinatario_sin_suscripcion(
    escuadron,
    remitente,
    destinatario,
    habilitar_vapid,
):
    with pytest.raises(SuscripcionToqueNoDisponibleError, match="falta de permisos"):
        enviar_toque(
            escuadron=escuadron,
            remitente=remitente,
            destinatario_id=destinatario.pk,
            mensaje="¡Ánimo!",
            webpush_fn=MagicMock(),
        )

    assert Toque.objects.count() == 0


@pytest.mark.django_db
def test_rechaza_si_falta_configuracion_vapid(
    escuadron,
    remitente,
    destinatario,
    suscripcion,
):
    webpush = MagicMock()
    with override_settings(
        VAPID_PUBLIC_KEY="",
        VAPID_PRIVATE_KEY="privada",
        VAPID_ADMIN_EMAIL="ops@habitsquad.local",
    ):
        with pytest.raises(SuscripcionToqueNoDisponibleError):
            enviar_toque(
                escuadron=escuadron,
                remitente=remitente,
                destinatario_id=destinatario.pk,
                mensaje="¡Ánimo!",
                webpush_fn=webpush,
            )

    webpush.assert_not_called()
    assert Toque.objects.count() == 0


@pytest.mark.django_db
def test_revierte_toque_si_fallan_todas_las_suscripciones(
    escuadron,
    remitente,
    destinatario,
    suscripcion,
    habilitar_vapid,
):
    webpush = MagicMock(side_effect=WebPushException("subscription gone"))

    with pytest.raises(SuscripcionToqueNoDisponibleError):
        enviar_toque(
            escuadron=escuadron,
            remitente=remitente,
            destinatario_id=destinatario.pk,
            mensaje="¡Ánimo!",
            webpush_fn=webpush,
        )

    assert Toque.objects.count() == 0


@pytest.mark.django_db
def test_envia_a_suscripciones_utilizables_si_otra_falla(
    escuadron,
    remitente,
    destinatario,
    suscripcion,
    habilitar_vapid,
):
    fallida = SuscripcionPush.objects.create(
        usuario=destinatario,
        endpoint="https://fcm.googleapis.com/fcm/send/falla",
        p256dh="fallida",
        auth="fallida",
    )

    def webpush(**kwargs):
        if kwargs["subscription_info"]["endpoint"] == fallida.endpoint:
            raise WebPushException("subscription gone")

    enviar_toque(
        escuadron=escuadron,
        remitente=remitente,
        destinatario_id=destinatario.pk,
        mensaje="¡Ánimo!",
        webpush_fn=webpush,
    )

    assert Toque.objects.count() == 1


@pytest.mark.django_db
def test_un_segundo_toque_el_mismo_dia_se_rechaza(
    escuadron,
    remitente,
    destinatario,
    suscripcion,
    habilitar_vapid,
):
    Toque.objects.create(
        escuadron=escuadron,
        remitente=remitente,
        destinatario=destinatario,
        fecha=timezone.localdate(),
        mensaje="Toque anterior",
    )
    webpush = MagicMock()

    with pytest.raises(ToqueDuplicadoError, match="ya ha recibido"):
        enviar_toque(
            escuadron=escuadron,
            remitente=remitente,
            destinatario_id=destinatario.pk,
            mensaje="Otro toque",
            webpush_fn=webpush,
        )

    webpush.assert_not_called()
    assert Toque.objects.count() == 1


@pytest.mark.django_db
def test_modelo_toque_representacion_y_unicidad(
    escuadron,
    remitente,
    destinatario,
):
    toque = Toque.objects.create(
        escuadron=escuadron,
        remitente=remitente,
        destinatario=destinatario,
        fecha=timezone.localdate(),
        mensaje="Toque de prueba",
    )

    assert str(toque) == (
        f"{remitente.pk} → {destinatario.pk} · {timezone.localdate()}"
    )

    with pytest.raises(IntegrityError), transaction.atomic():
        Toque.objects.create(
            escuadron=escuadron,
            remitente=remitente,
            destinatario=destinatario,
            fecha=timezone.localdate(),
            mensaje="Duplicado",
        )


@pytest.mark.django_db
def test_limite_diario_es_global_entre_escuadrones(
    escuadron,
    remitente,
    destinatario,
    suscripcion,
    habilitar_vapid,
    db,
):
    Toque.objects.create(
        escuadron=escuadron,
        remitente=remitente,
        destinatario=destinatario,
        fecha=timezone.localdate(),
        mensaje="Toque en primer escuadrón",
    )
    otro_escuadron = Escuadron.objects.create(
        nombre="Otro grupo",
        creador=remitente,
        codigo_invitacion="OTRO01",
    )
    Membresia.objects.create(escuadron=otro_escuadron, usuario=remitente)
    membresia_destinatario = Membresia.objects.create(
        escuadron=otro_escuadron,
        usuario=destinatario,
    )
    HabitoDiario.objects.create(
        membresia=membresia_destinatario,
        opcion=HabitoDiario.Opcion.LEER,
    )

    with pytest.raises(ToqueDuplicadoError):
        enviar_toque(
            escuadron=otro_escuadron,
            remitente=remitente,
            destinatario_id=destinatario.pk,
            mensaje="Toque desde segundo escuadrón",
            webpush_fn=MagicMock(),
        )


@pytest.mark.django_db
def test_api_enviar_toque_devuelve_201_y_payload(
    api_client,
    endpoint,
    destinatario,
    suscripcion,
    habilitar_vapid,
    monkeypatch,
):
    webpush = MagicMock()
    service = enviar_toque

    def enviar_con_mock(**kwargs):
        return service(**kwargs, webpush_fn=webpush)

    monkeypatch.setattr("alertas.api.toques.enviar_toque", enviar_con_mock)
    response = api_client.post(
        endpoint,
        {"destinatario_id": destinatario.pk, "mensaje": "¡Ánimo!"},
        format="json",
    )

    assert response.status_code == 201
    assert response.json() == {
        "id": Toque.objects.get().pk,
        "fecha": timezone.localdate().isoformat(),
        "enviado": True,
    }
    assert json.loads(webpush.call_args.kwargs["data"]) == {
        "title": "Toque de Remitente",
        "body": "¡Ánimo!",
    }


@pytest.mark.django_db
def test_api_requiere_autenticacion(db, endpoint):
    response = APIClient().post(
        endpoint,
        {"destinatario_id": 2, "mensaje": "¡Ánimo!"},
        format="json",
    )

    assert response.status_code == 401


@pytest.mark.django_db
def test_api_rechaza_remitente_que_no_pertenece(
    destinatario,
    db,
):
    otro = CustomUser.objects.create_user(
        email="otro-remitente-toque@example.com",
        password="S0mething!Secure-497",
        nickname="OtroRemitente",
    )
    escuadron = Escuadron.objects.create(
        nombre="Privado",
        creador=destinatario,
        codigo_invitacion="PRIV01",
    )
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {AccessToken.for_user(otro)}")

    response = client.post(
        reverse("alertas:enviar-toque", kwargs={"escuadron_id": escuadron.pk}),
        {"destinatario_id": destinatario.pk, "mensaje": "¡Ánimo!"},
        format="json",
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_api_escuadron_inexistente_devuelve_404(api_client):
    response = api_client.post(
        reverse("alertas:enviar-toque", kwargs={"escuadron_id": 99999}),
        {"destinatario_id": 2, "mensaje": "¡Ánimo!"},
        format="json",
    )

    assert response.status_code == 404


@pytest.mark.django_db
@pytest.mark.parametrize(
    "body",
    [
        {"mensaje": "¡Ánimo!"},
        {"destinatario_id": 12},
        {"destinatario_id": 12, "mensaje": "   "},
    ],
)
def test_api_rechaza_body_invalido(api_client, endpoint, body):
    response = api_client.post(endpoint, body, format="json")

    assert response.status_code == 400


@pytest.mark.django_db
def test_api_rechaza_autotoque(api_client, endpoint, remitente):
    response = api_client.post(
        endpoint,
        {"destinatario_id": remitente.pk, "mensaje": "¡Ánimo!"},
        format="json",
    )

    assert response.status_code == 400
    assert "No puedes enviarte" in response.data["detail"]


@pytest.mark.django_db
def test_api_devuelve_400_si_no_hay_suscripcion(
    api_client,
    endpoint,
    destinatario,
    habilitar_vapid,
):
    response = api_client.post(
        endpoint,
        {"destinatario_id": destinatario.pk, "mensaje": "¡Ánimo!"},
        format="json",
    )

    assert response.status_code == 400
    assert "falta de permisos" in response.data["detail"]


@pytest.mark.django_db
@pytest.mark.parametrize(
    "estado",
    [RegistroDiario.Estado.CUMPLIDO, RegistroDiario.Estado.NO_CUMPLIDO],
)
def test_api_bloquea_tareas_cerradas(
    api_client,
    endpoint,
    escuadron,
    destinatario,
    estado,
):
    habito = HabitoDiario.objects.get(
        membresia__escuadron=escuadron,
        membresia__usuario=destinatario,
    )
    RegistroDiario.objects.create(
        habito=habito,
        fecha=timezone.localdate(),
        cloudinary_public_id="foto/cerrada-api",
        estado=estado,
    )

    response = api_client.post(
        endpoint,
        {"destinatario_id": destinatario.pk, "mensaje": "¡Ánimo!"},
        format="json",
    )

    assert response.status_code == 400
    assert "tarea pendiente" in response.data["detail"]
    assert Toque.objects.count() == 0


@pytest.mark.django_db
def test_api_segundo_toque_devuelve_409(
    api_client,
    endpoint,
    escuadron,
    remitente,
    destinatario,
    suscripcion,
    habilitar_vapid,
):
    Toque.objects.create(
        escuadron=escuadron,
        remitente=remitente,
        destinatario=destinatario,
        fecha=timezone.localdate(),
        mensaje="Toque anterior",
    )
    response = api_client.post(
        endpoint,
        {"destinatario_id": destinatario.pk, "mensaje": "¡Ánimo!"},
        format="json",
    )

    assert response.status_code == 409
    assert "ya ha recibido" in response.data["detail"]
