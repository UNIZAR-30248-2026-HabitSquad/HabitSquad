from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import EscuadronCreateSerializer


class EscuadronCreateView(generics.CreateAPIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = EscuadronCreateSerializer

    @extend_schema(
        request=EscuadronCreateSerializer,
        responses={
            201: EscuadronCreateSerializer,
            400: OpenApiResponse(description="Los datos enviados no son válidos."),
            401: OpenApiResponse(
                description="Falta el access token, es inválido o ha expirado."
            ),
        },
        description=(
            "Crea un escuadrón. El usuario autenticado queda como miembro "
            "administrador y recibe un código de invitación único de 6 caracteres."
        ),
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
