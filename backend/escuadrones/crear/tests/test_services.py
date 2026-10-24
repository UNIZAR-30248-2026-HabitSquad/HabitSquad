from unittest.mock import patch

import pytest
from django.db import IntegrityError

from escuadrones.crear.services.creation import create_escuadron
from escuadrones.crear.services.invitation_code import (
    INVITATION_CODE_ALPHABET,
    INVITATION_CODE_LENGTH,
    allocate_unique_invitation_code,
    generate_invitation_code,
)
from escuadrones.models import Escuadron, Membresia
from usuarios.models import CustomUser


@pytest.fixture
def user(db):
    return CustomUser.objects.create_user(
        email="creador@example.com",
        password="S0mething!Secure-497",
    )


def test_generate_invitation_code_has_expected_format():
    code = generate_invitation_code()

    assert len(code) == INVITATION_CODE_LENGTH
    assert all(character in INVITATION_CODE_ALPHABET for character in code)


@pytest.mark.django_db
def test_allocate_unique_invitation_code_skips_existing_codes(user):
    Escuadron.objects.create(
        nombre="Existente",
        creador=user,
        codigo_invitacion="AAAAAA",
    )

    with patch(
        "escuadrones.crear.services.invitation_code.generate_invitation_code",
        side_effect=["AAAAAA", "BBBBBB"],
    ):
        code = allocate_unique_invitation_code()

    assert code == "BBBBBB"


@pytest.mark.django_db
def test_allocate_unique_invitation_code_raises_after_exhausted_attempts(user):
    Escuadron.objects.create(
        nombre="Existente",
        creador=user,
        codigo_invitacion="AAAAAA",
    )

    with (
        patch(
            "escuadrones.crear.services.invitation_code.generate_invitation_code",
            return_value="AAAAAA",
        ),
        pytest.raises(RuntimeError, match="código de invitación único"),
    ):
        allocate_unique_invitation_code()


@pytest.mark.django_db
def test_create_escuadron_assigns_creator_as_admin_member(user):
    with patch(
        "escuadrones.crear.services.creation.allocate_unique_invitation_code",
        return_value="X8K9QL",
    ):
        escuadron = create_escuadron(nombre="Madrugadores", creador=user)

    assert escuadron.nombre == "Madrugadores"
    assert escuadron.creador == user
    assert escuadron.codigo_invitacion == "X8K9QL"

    membresia = Membresia.objects.get(escuadron=escuadron, usuario=user)
    assert membresia.es_administrador is True
    assert list(escuadron.miembros.all()) == [user]


@pytest.mark.django_db
def test_create_escuadron_retries_on_integrity_error(user):
    real_create = Escuadron.objects.create
    call_count = {"value": 0}

    def create_side_effect(**kwargs):
        call_count["value"] += 1
        if call_count["value"] == 1:
            raise IntegrityError("duplicate")
        return real_create(**kwargs)

    with (
        patch(
            "escuadrones.crear.services.creation.allocate_unique_invitation_code",
            side_effect=["AAAAAA", "BBBBBB"],
        ),
        patch(
            "escuadrones.crear.services.creation.Escuadron.objects.create",
            side_effect=create_side_effect,
        ),
    ):
        escuadron = create_escuadron(nombre="Reintento", creador=user)

    assert escuadron.codigo_invitacion == "BBBBBB"
    assert call_count["value"] == 2
    assert Membresia.objects.filter(
        escuadron=escuadron,
        usuario=user,
        es_administrador=True,
    ).exists()


@pytest.mark.django_db
def test_create_escuadron_raises_after_exhausted_integrity_retries(user):
    with (
        patch(
            "escuadrones.crear.services.creation.allocate_unique_invitation_code",
            return_value="AAAAAA",
        ),
        patch(
            "escuadrones.crear.services.creation.Escuadron.objects.create",
            side_effect=IntegrityError("duplicate"),
        ),
        pytest.raises(RuntimeError, match="código de invitación único"),
    ):
        create_escuadron(nombre="Colision", creador=user)
