from django.db import IntegrityError, transaction

from escuadrones.models import Escuadron, Membresia

from .invitation_code import (
    MAX_GENERATION_ATTEMPTS,
    allocate_unique_invitation_code,
)


def create_escuadron(*, nombre: str, creador) -> Escuadron:
    last_error: IntegrityError | None = None
    for _ in range(MAX_GENERATION_ATTEMPTS):
        codigo = allocate_unique_invitation_code()
        try:
            with transaction.atomic():
                escuadron = Escuadron.objects.create(
                    nombre=nombre,
                    creador=creador,
                    codigo_invitacion=codigo,
                )
                Membresia.objects.create(
                    escuadron=escuadron,
                    usuario=creador,
                    es_administrador=True,
                )
                return escuadron
        except IntegrityError as error:
            last_error = error
            continue
    raise RuntimeError(
        "No se pudo persistir un escuadrón con código de invitación único."
    ) from last_error
