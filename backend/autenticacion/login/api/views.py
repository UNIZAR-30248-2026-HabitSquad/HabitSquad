from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import LoginRequestSerializer, TokenPairResponseSerializer


@extend_schema_view(
    post=extend_schema(
        request=LoginRequestSerializer,
        responses={
            200: TokenPairResponseSerializer,
            401: OpenApiResponse(
                description="Email o contraseña incorrectos, o cuenta inactiva."
            ),
            429: OpenApiResponse(
                description="Se ha superado el límite de intentos de inicio de sesión."
            ),
        },
        description=(
            "Autentica con email y contraseña y devuelve access y refresh. "
            "Después de registrarse, el cliente llama a este endpoint "
            "con las mismas credenciales para establecer la sesión."
        ),
    )
)
class LoginView(TokenObtainPairView):
    authentication_classes = ()
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "login"
