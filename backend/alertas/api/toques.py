from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from alertas.services import (
    SuscripcionToqueNoDisponibleError,
    ToqueDuplicadoError,
    ToqueError,
    enviar_toque,
)
from escuadrones.models import Escuadron, Membresia

from .serializers import (
    ErrorDetalleToqueSerializer,
    ErrorToqueSerializer,
    ToqueCreateSerializer,
    ToqueResponseSerializer,
)


class ToqueView(APIView):
    """Envía a un miembro pendiente un toque mediante Web Push."""

    authentication_classes = (JWTAuthentication,)
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        operation_id="enviarToqueInterpersonal",
        tags=["Alertas"],
        summary="Enviar un toque a un compañero",
        request=ToqueCreateSerializer,
        responses={
            201: OpenApiResponse(
                response=ToqueResponseSerializer,
                description="Toque registrado y enviado por Web Push.",
            ),
            400: OpenApiResponse(
                response=ErrorToqueSerializer,
                description=(
                    "Body inválido, autotoque, destinatario sin tarea pendiente "
                    "o falta de suscripción/permisos para recibir Web Push."
                ),
            ),
            401: OpenApiResponse(
                response=ErrorDetalleToqueSerializer,
                description="Falta un JWT válido.",
            ),
            403: OpenApiResponse(
                response=ErrorDetalleToqueSerializer,
                description="El remitente no pertenece al escuadrón.",
            ),
            404: OpenApiResponse(
                response=ErrorDetalleToqueSerializer,
                description="El escuadrón no existe.",
            ),
            409: OpenApiResponse(
                response=ErrorDetalleToqueSerializer,
                description="El destinatario ya recibió un toque hoy.",
            ),
        },
        description=(
            "Envía un mensaje libre a un compañero del escuadrón cuya tarea "
            "de hoy siga pendiente. El remitente se obtiene del JWT; no se "
            "permite enviarse un toque a sí mismo. Se admite un toque por "
            "destinatario y fecha local (Europe/Madrid), global entre "
            "escuadrones. El destinatario debe tener una suscripción Web "
            "Push activa. La notificación emergente se entrega fuera de HTTP "
            "mediante el service worker con este payload:\n\n"
            "```json\n"
            '{"title": "Toque de {nickname}", "body": "{mensaje}"}\n'
            "```\n\n"
            "El navegador debe tener permiso para mostrar notificaciones. "
            "Repetir el envío el mismo día devuelve 409 y no crea otro toque."
        ),
        examples=[
            OpenApiExample(
                "Enviar toque",
                value={"destinatario_id": 12, "mensaje": "¡Ánimo, tú puedes!"},
                request_only=True,
            ),
            OpenApiExample(
                "Toque enviado",
                value={"id": 4, "fecha": "2026-11-28", "enviado": True},
                response_only=True,
                status_codes=["201"],
            ),
        ],
    )
    def post(self, request, escuadron_id: int, *args, **kwargs):
        escuadron = get_object_or_404(Escuadron, pk=escuadron_id)
        if not Membresia.objects.filter(
            escuadron=escuadron,
            usuario=request.user,
        ).exists():
            raise PermissionDenied("El usuario no pertenece a este escuadrón.")

        serializer = ToqueCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            toque = enviar_toque(
                escuadron=escuadron,
                remitente=request.user,
                destinatario_id=serializer.validated_data["destinatario_id"],
                mensaje=serializer.validated_data["mensaje"],
            )
        except SuscripcionToqueNoDisponibleError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        except ToqueDuplicadoError as error:
            return Response({"detail": str(error)}, status=status.HTTP_409_CONFLICT)
        except ToqueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"id": toque.pk, "fecha": toque.fecha, "enviado": True},
            status=status.HTTP_201_CREATED,
        )
