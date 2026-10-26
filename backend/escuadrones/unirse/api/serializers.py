from rest_framework import serializers, status
from rest_framework.exceptions import APIException, NotFound

from escuadrones.crear.api.serializers import MembresiaSerializer
from escuadrones.crear.services.invitation_code import (
    INVITATION_CODE_ALPHABET,
    INVITATION_CODE_LENGTH,
)
from escuadrones.models import Escuadron
from escuadrones.unirse.services.join import (
    AlreadyMemberError,
    SquadronNotFoundError,
    normalize_invitation_code,
    unirse_escuadron,
)


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Ya perteneces a este escuadrón."
    default_code = "conflict"


class EscuadronJoinSerializer(serializers.ModelSerializer):
    codigo_invitacion = serializers.CharField()
    miembros = MembresiaSerializer(source="membresias", many=True, read_only=True)
    creador_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Escuadron
        fields = (
            "id",
            "nombre",
            "codigo_invitacion",
            "creador_id",
            "miembros",
        )
        read_only_fields = (
            "id",
            "nombre",
            "creador_id",
            "miembros",
        )

    def validate_codigo_invitacion(self, value):
        codigo = normalize_invitation_code(value)
        if len(codigo) != INVITATION_CODE_LENGTH:
            raise serializers.ValidationError(
                "El código de invitación debe tener 6 caracteres."
            )
        if any(character not in INVITATION_CODE_ALPHABET for character in codigo):
            raise serializers.ValidationError(
                "El código de invitación solo puede contener letras A-Z y dígitos."
            )
        return codigo

    def create(self, validated_data):
        try:
            return unirse_escuadron(
                codigo_invitacion=validated_data["codigo_invitacion"],
                usuario=self.context["request"].user,
            )
        except SquadronNotFoundError as error:
            raise NotFound(detail=str(error)) from error
        except AlreadyMemberError as error:
            raise Conflict(detail=str(error)) from error
