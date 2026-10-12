from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from autenticacion.registro.services.registration import create_registered_user
from usuarios.models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    class Meta:
        model = CustomUser
        fields = ("id", "email", "password", "date_joined")
        read_only_fields = ("id", "date_joined")

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        if CustomUser.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este email.")
        return normalized_email

    def validate(self, attrs):
        validate_password(
            attrs["password"],
            user=CustomUser(email=attrs["email"]),
        )
        return attrs

    def create(self, validated_data):
        return create_registered_user(**validated_data)
