from unittest.mock import Mock

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from escuadrones.expulsar.services import (
    AdministradorNoExpulsableError,
    EscuadronNoEncontradoError,
    MiembroNoEncontradoError,
    SolicitanteNoAdministradorError,
    expulsar_miembro,
)
from escuadrones.models import Escuadron, Membresia
from habitos.models import HabitoDiario, RegistroDiario, VotoValidacion
from usuarios.models import CustomUser


@pytest.fixture
def administrador(db):
    return CustomUser.objects.create_user(
        email="admin-expulsion@example.com",
        password="S0mething!Secure-497",
        nickname="AdminExpulsion",
    )


@pytest.fixture
def escuadron(administrador):
    escuadron = Escuadron.objects.create(
        nombre="Expulsiones",
        creador=administrador,
        codigo_invitacion="EXPUL1",
    )
    Membresia.objects.create(
        escuadron=escuadron,
        usuario=administrador,
        es_administrador=True,
    )
    return escuadron


@pytest.fixture
def miembro(escuadron):
    usuario = CustomUser.objects.create_user(
        email="miembro-expulsion@example.com",
        password="S0mething!Secure-497",
        nickname="MiembroExpulsion",
    )
    Membresia.objects.create(escuadron=escuadron, usuario=usuario)
    return usuario


@pytest.fixture
def api_client(administrador):
    client = APIClient()
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {AccessToken.for_user(administrador)}"
    )
    return client


@pytest.fixture
def endpoint(escuadron, miembro):
    return reverse(
        "escuadrones:expulsar-miembro",
        kwargs={"escuadron_id": escuadron.pk, "usuario_id": miembro.pk},
    )


@pytest.mark.django_db
def test_expulsar_miembro_elimina_membresia_votos_y_emite_evento(
    escuadron,
    administrador,
    miembro,
    monkeypatch,
):
    membresia = Membresia.objects.get(escuadron=escuadron, usuario=miembro)
    habito = HabitoDiario.objects.create(
        membresia=membresia,
        opcion=HabitoDiario.Opcion.LEER,
    )
    registro = RegistroDiario.objects.create(
        habito=habito,
        cloudinary_public_id="foto/expulsion",
        fecha=timezone.localdate(),
    )
    VotoValidacion.objects.create(
        registro=registro,
        usuario=administrador,
        voto=VotoValidacion.Valor.NO,
    )
    publicar_evento = Mock()
    monkeypatch.setattr(
        "escuadrones.expulsar.services.expulsion.programar_actualizacion_panel",
        publicar_evento,
    )

    expulsar_miembro(
        escuadron_id=escuadron.pk,
        usuario_id=miembro.pk,
        solicitante=administrador,
    )

    assert not Membresia.objects.filter(pk=membresia.pk).exists()
    assert not VotoValidacion.objects.filter(pk__isnull=False).exists()
    publicar_evento.assert_called_once_with(
        escuadron_id=escuadron.pk,
        motivo="miembro_expulsado",
    )


@pytest.mark.django_db
def test_expulsar_miembro_rechaza_escuadron_inexistente(administrador):
    with pytest.raises(EscuadronNoEncontradoError):
        expulsar_miembro(
            escuadron_id=99999,
            usuario_id=administrador.pk,
            solicitante=administrador,
        )


@pytest.mark.django_db
def test_expulsar_miembro_requiere_solicitante_administrador(
    escuadron,
    administrador,
    miembro,
):
    with pytest.raises(SolicitanteNoAdministradorError):
        expulsar_miembro(
            escuadron_id=escuadron.pk,
            usuario_id=administrador.pk,
            solicitante=miembro,
        )


@pytest.mark.django_db
def test_expulsar_miembro_rechaza_objetivo_que_no_es_miembro(
    escuadron,
    administrador,
):
    with pytest.raises(MiembroNoEncontradoError):
        expulsar_miembro(
            escuadron_id=escuadron.pk,
            usuario_id=99999,
            solicitante=administrador,
        )


@pytest.mark.django_db
def test_expulsar_miembro_no_elimina_otro_administrador(
    escuadron,
    administrador,
    db,
):
    otro_admin = CustomUser.objects.create_user(
        email="otro-admin-expulsion@example.com",
        password="S0mething!Secure-497",
        nickname="OtroAdminExpulsion",
    )
    Membresia.objects.create(
        escuadron=escuadron,
        usuario=otro_admin,
        es_administrador=True,
    )

    with pytest.raises(AdministradorNoExpulsableError):
        expulsar_miembro(
            escuadron_id=escuadron.pk,
            usuario_id=otro_admin.pk,
            solicitante=administrador,
        )


@pytest.mark.django_db
def test_expulsar_miembro_no_elimina_al_creador_no_admin(
    administrador,
    db,
):
    creador = CustomUser.objects.create_user(
        email="creador-expulsion@example.com",
        password="S0mething!Secure-497",
        nickname="CreadorExpulsion",
    )
    escuadron = Escuadron.objects.create(
        nombre="Creador protegido",
        creador=creador,
        codigo_invitacion="CREA01",
    )
    Membresia.objects.create(
        escuadron=escuadron,
        usuario=administrador,
        es_administrador=True,
    )
    Membresia.objects.create(escuadron=escuadron, usuario=creador)

    with pytest.raises(AdministradorNoExpulsableError):
        expulsar_miembro(
            escuadron_id=escuadron.pk,
            usuario_id=creador.pk,
            solicitante=administrador,
        )


@pytest.mark.django_db
def test_api_expulsion_requiere_autenticacion(endpoint):
    response = APIClient().delete(endpoint)

    assert response.status_code == 401


@pytest.mark.django_db
def test_api_expulsa_miembro_y_responde_204(api_client, endpoint, miembro):
    response = api_client.delete(endpoint)

    assert response.status_code == 204
    assert not Membresia.objects.filter(usuario=miembro).exists()


@pytest.mark.django_db
def test_api_expulsion_escuadron_inexistente_devuelve_404(api_client):
    response = api_client.delete(
        reverse(
            "escuadrones:expulsar-miembro",
            kwargs={"escuadron_id": 99999, "usuario_id": 99999},
        )
    )

    assert response.status_code == 404


@pytest.mark.django_db
def test_api_expulsion_miembro_inexistente_devuelve_404(api_client, escuadron):
    response = api_client.delete(
        reverse(
            "escuadrones:expulsar-miembro",
            kwargs={"escuadron_id": escuadron.pk, "usuario_id": 99999},
        )
    )

    assert response.status_code == 404


@pytest.mark.django_db
def test_api_expulsion_no_admin_devuelve_403(escuadron, miembro):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {AccessToken.for_user(miembro)}")
    response = client.delete(
        reverse(
            "escuadrones:expulsar-miembro",
            kwargs={"escuadron_id": escuadron.pk, "usuario_id": miembro.pk},
        )
    )

    assert response.status_code == 403


@pytest.mark.django_db
def test_api_expulsion_admin_objetivo_devuelve_403(api_client, escuadron, miembro):
    Membresia.objects.filter(escuadron=escuadron, usuario=miembro).update(
        es_administrador=True
    )
    response = api_client.delete(
        reverse(
            "escuadrones:expulsar-miembro",
            kwargs={"escuadron_id": escuadron.pk, "usuario_id": miembro.pk},
        )
    )

    assert response.status_code == 403
