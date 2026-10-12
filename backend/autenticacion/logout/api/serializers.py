from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError

from autenticacion.logout.services.revocation import revoke_refresh_token


class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_refresh(self, value):
        try:
            revoke_refresh_token(value)
        except TokenError as error:
            raise serializers.ValidationError(
                "El refresh es inválido, ha expirado o ya fue revocado."
            ) from error
        return value
