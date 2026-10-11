from rest_framework import serializers


class RefreshTokenRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)


class RefreshTokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
