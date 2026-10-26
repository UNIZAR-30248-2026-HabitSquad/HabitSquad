from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import EscuadronJoinSerializer


class EscuadronJoinView(generics.CreateAPIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = EscuadronJoinSerializer

    @extend_schema(
        request=EscuadronJoinSerializer,
        responses={
            201: EscuadronJoinSerializer,
            400: OpenApiResponse(description="Los datos enviados no son válidos."),
            401: OpenApiResponse(
                description="Falta el access token, es inválido o ha expirado."
            ),
            404: OpenApiResponse(
                description="No existe un escuadrón con ese código de invitación."
            ),
            409: OpenApiResponse(
                description="El usuario autenticado ya es miembro del escuadrón."
            ),
        },
        description=(
            "Une al usuario autenticado a un escuadrón mediante un código de "
            "invitación de 6 caracteres. Queda como miembro no administrador."
        ),
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
