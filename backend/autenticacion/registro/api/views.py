from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle

from .serializers import UserRegistrationSerializer


class UserRegistrationView(generics.CreateAPIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)
    throttle_classes = (AnonRateThrottle,)
    serializer_class = UserRegistrationSerializer

    @extend_schema(
        request=UserRegistrationSerializer,
        responses={
            201: UserRegistrationSerializer,
            400: OpenApiResponse(description="Los datos enviados no son válidos."),
            429: OpenApiResponse(
                description="Se ha superado el límite de solicitudes."
            ),
        },
        description=(
            "Registra una cuenta con email y contraseña. "
            "La respuesta 201 devuelve id, email y date_joined, sin tokens. "
            "La sesión JWT se obtiene con POST /api/auth/token/."
        ),
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
