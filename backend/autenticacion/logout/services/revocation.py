from rest_framework_simplejwt.tokens import RefreshToken


def revoke_refresh_token(token: str) -> None:
    RefreshToken(token).blacklist()
