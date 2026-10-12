from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LogoutRequestSerializer


class LogoutView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)

    @extend_schema(
        request=LogoutRequestSerializer,
        responses={
            204: OpenApiResponse(description="Sesión cerrada correctamente."),
            400: OpenApiResponse(
                description=(
                    "El refresh falta, no es válido, expiró o ya fue revocado."
                )
            ),
        },
        description="Revoca el refresh token para cerrar la sesión actual.",
    )
    def post(self, request):
        serializer = LogoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
