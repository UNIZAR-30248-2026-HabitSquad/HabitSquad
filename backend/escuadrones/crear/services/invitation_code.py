import secrets
import string

from escuadrones.models import Escuadron

INVITATION_CODE_LENGTH = 6
INVITATION_CODE_ALPHABET = string.ascii_uppercase + string.digits
MAX_GENERATION_ATTEMPTS = 32


def generate_invitation_code() -> str:
    return "".join(
        secrets.choice(INVITATION_CODE_ALPHABET) for _ in range(INVITATION_CODE_LENGTH)
    )


def allocate_unique_invitation_code() -> str:
    for _ in range(MAX_GENERATION_ATTEMPTS):
        code = generate_invitation_code()
        if not Escuadron.objects.filter(codigo_invitacion=code).exists():
            return code
    raise RuntimeError(
        "No se pudo generar un código de invitación único tras varios intentos."
    )
