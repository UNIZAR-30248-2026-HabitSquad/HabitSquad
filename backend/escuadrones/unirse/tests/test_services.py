from unittest.mock import patch

import pytest
from django.db import IntegrityError

from escuadrones.models import Escuadron, Membresia
from escuadrones.unirse.services.join import (
    AlreadyMemberError,
    SquadronNotFoundError,
    normalize_invitation_code,
    unirse_escuadron,
)
from usuarios.models import CustomUser


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


def test_normalize_invitation_code_strips_and_uppercases():
    assert normalize_invitation_code("  x8k9ql  ") == "X8K9QL"


@pytest.mark.django_db
def test_unirse_escuadron_adds_non_admin_member(escuadron, joiner):
    result = unirse_escuadron(codigo_invitacion="x8k9ql", usuario=joiner)

    assert result.pk == escuadron.pk
    membresia = Membresia.objects.get(escuadron=escuadron, usuario=joiner)
    assert membresia.es_administrador is False


@pytest.mark.django_db
def test_unirse_escuadron_raises_when_code_unknown(joiner):
    with pytest.raises(
        SquadronNotFoundError,
        match="No se ha encontrado un escuadrón con ese código",
    ):
        unirse_escuadron(codigo_invitacion="ZZZZZZ", usuario=joiner)

    assert Membresia.objects.filter(usuario=joiner).count() == 0


@pytest.mark.django_db
def test_unirse_escuadron_raises_when_already_member(escuadron, joiner):
    unirse_escuadron(codigo_invitacion="X8K9QL", usuario=joiner)

    with pytest.raises(AlreadyMemberError, match="Ya perteneces a este escuadrón"):
        unirse_escuadron(codigo_invitacion="X8K9QL", usuario=joiner)

    assert Membresia.objects.filter(escuadron=escuadron, usuario=joiner).count() == 1


@pytest.mark.django_db
def test_unirse_escuadron_maps_integrity_error_to_already_member(escuadron, joiner):
    with (
        patch(
            "escuadrones.unirse.services.join.Membresia.objects.create",
            side_effect=IntegrityError("duplicate"),
        ),
        pytest.raises(AlreadyMemberError, match="Ya perteneces a este escuadrón"),
    ):
        unirse_escuadron(codigo_invitacion="X8K9QL", usuario=joiner)

    assert not Membresia.objects.filter(escuadron=escuadron, usuario=joiner).exists()
