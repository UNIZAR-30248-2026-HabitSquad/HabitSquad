from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenRefreshView

from .serializers import (
    RefreshTokenRequestSerializer,
    RefreshTokenResponseSerializer,
)


@extend_schema_view(
    post=extend_schema(
        request=RefreshTokenRequestSerializer,
        responses={
            200: RefreshTokenResponseSerializer,
            400: OpenApiResponse(description="Falta el token refresh."),
            401: OpenApiResponse(
                description="El token refresh no es válido, ha expirado o ya se usó."
            ),
        },
        description="Renueva el par de tokens y revoca el refresh anterior.",
    )
)
class RefreshTokenView(TokenRefreshView):
    authentication_classes = ()
    permission_classes = (AllowAny,)
