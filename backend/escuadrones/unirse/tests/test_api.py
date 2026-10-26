import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from escuadrones.models import Escuadron, Membresia
from usuarios.models import CustomUser

JOIN_URL = "escuadrones:unirse-escuadron"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def creator(db):
    return CustomUser.objects.create_user(
        email="creador@example.com",
        password="S0mething!Secure-497",
    )


@pytest.fixture
def joiner(db):
    return CustomUser.objects.create_user(
        email="miembro@example.com",
        password="S0mething!Secure-497",
    )


@pytest.fixture
def escuadron(creator):
    escuadron = Escuadron.objects.create(
        nombre="Madrugadores",
        creador=creator,
        codigo_invitacion="X8K9QL",
    )
    Membresia.objects.create(
        escuadron=escuadron,
        usuario=creator,
        es_administrador=True,
    )
    return escuadron


@pytest.fixture
def auth_joiner(api_client, joiner):
    token = AccessToken.for_user(joiner)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client


@pytest.mark.django_db
def test_join_escuadron_requires_authentication(api_client, escuadron):
    response = api_client.post(
        reverse(JOIN_URL),
        {"codigo_invitacion": escuadron.codigo_invitacion},
        format="json",
    )

    assert response.status_code == 401
    assert Membresia.objects.filter(escuadron=escuadron).count() == 1


@pytest.mark.django_db
def test_join_escuadron_with_valid_code_adds_member(
    auth_joiner,
    creator,
    joiner,
    escuadron,
):
    response = auth_joiner.post(
        reverse(JOIN_URL),
        {"codigo_invitacion": "x8k9ql"},
        format="json",
    )

    assert response.status_code == 201
    assert set(response.data) == {
        "id",
        "nombre",
        "codigo_invitacion",
        "creador_id",
        "miembros",
    }
    assert response.data["id"] == escuadron.pk
    assert response.data["nombre"] == "Madrugadores"
    assert response.data["codigo_invitacion"] == "X8K9QL"
    assert response.data["creador_id"] == creator.pk
    assert {"usuario_id": creator.pk, "es_administrador": True} in response.data[
        "miembros"
    ]
    assert {"usuario_id": joiner.pk, "es_administrador": False} in response.data[
        "miembros"
    ]

    membresia = Membresia.objects.get(escuadron=escuadron, usuario=joiner)
    assert membresia.es_administrador is False
    assert Membresia.objects.filter(escuadron=escuadron).count() == 2
