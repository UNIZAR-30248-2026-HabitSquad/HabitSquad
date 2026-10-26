from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import (
    ErrorDetalleSerializer,
    ErrorValidacionCodigoInvitacionSerializer,
    EscuadronJoinSerializer,
)


class EscuadronJoinView(generics.CreateAPIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = EscuadronJoinSerializer

    @extend_schema(
        operation_id="unirseAUnEscuadron",
        tags=["Escuadrones"],
        summary="Unirse a un escuadrón",
        request=EscuadronJoinSerializer,
        responses={
            201: OpenApiResponse(
                response=EscuadronJoinSerializer,
                description="El usuario queda unido al escuadrón como miembro.",
            ),
            400: OpenApiResponse(
                response=ErrorValidacionCodigoInvitacionSerializer,
                description="El código debe tener 6 caracteres alfanuméricos.",
            ),
            401: OpenApiResponse(
                response=ErrorDetalleSerializer,
                description="Falta el access token, es inválido o ha expirado.",
            ),
            404: OpenApiResponse(
                response=ErrorDetalleSerializer,
                description="No existe un escuadrón con ese código de invitación.",
            ),
            409: OpenApiResponse(
                response=ErrorDetalleSerializer,
                description="El usuario autenticado ya es miembro del escuadrón.",
            ),
        },
        description=(
            "Une al usuario autenticado a un escuadrón mediante un código de "
            "invitación de 6 caracteres alfanuméricos. Se aceptan minúsculas, "
            "que se normalizan a mayúsculas. Queda como miembro no administrador. "
            "Si ya pertenece al escuadrón, la operación responde 409."
        ),
        examples=[
            OpenApiExample(
                "Código válido",
                value={"codigo_invitacion": "X8K9QL"},
                request_only=True,
            ),
            OpenApiExample(
                "Formato no válido",
                value={
                    "codigo_invitacion": [
                        "El código de invitación debe tener 6 caracteres."
                    ]
                },
                response_only=True,
                status_codes=["400"],
            ),
            OpenApiExample(
                "Código desconocido",
                value={"detail": "No se ha encontrado un escuadrón con ese código"},
                response_only=True,
                status_codes=["404"],
            ),
            OpenApiExample(
                "Ya es miembro",
                value={"detail": "Ya perteneces a este escuadrón"},
                response_only=True,
                status_codes=["409"],
            ),
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
