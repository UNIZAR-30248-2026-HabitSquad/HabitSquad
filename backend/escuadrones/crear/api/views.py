from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import EscuadronCreateSerializer


class EscuadronCreateView(generics.CreateAPIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = EscuadronCreateSerializer

    @extend_schema(
        operation_id="crearEscuadron",
        tags=["Escuadrones"],
        summary="Crear un escuadrón",
        request=EscuadronCreateSerializer,
        responses={
            201: OpenApiResponse(
                response=EscuadronCreateSerializer,
                description=(
                    "El escuadrón se ha creado y el usuario autenticado es "
                    "su miembro administrador."
                ),
            ),
            400: OpenApiResponse(description="Los datos enviados no son válidos."),
            401: OpenApiResponse(
                description="Falta el access token, es inválido o ha expirado."
            ),
        },
        description=(
            "Crea un escuadrón. El usuario autenticado queda como miembro "
            "administrador y recibe un código de invitación único de 6 caracteres."
        ),
        examples=[
            OpenApiExample(
                "Crear escuadrón",
                value={"nombre": "Madrugadores"},
                request_only=True,
            ),
            OpenApiExample(
                "Escuadrón creado",
                value={
                    "id": 1,
                    "nombre": "Madrugadores",
                    "codigo_invitacion": "A1B2C3",
                    "creador_id": 42,
                    "miembros": [
                        {"usuario_id": 42, "es_administrador": True},
                    ],
                },
                response_only=True,
                status_codes=["201"],
            ),
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
