from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from usuarios.models import CustomUser


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return CustomUser.objects.create_user(
        email="person@example.com",
        password="S0mething!Secure-497",
    )


@pytest.fixture
def refresh_token(user):
    return RefreshToken.for_user(user)


@pytest.mark.django_db
def test_logout_blacklists_refresh_and_returns_no_content(api_client, refresh_token):
    token = str(refresh_token)

    response = api_client.post(
        reverse("autenticacion:logout"),
        {"refresh": token},
        format="json",
    )

    assert response.status_code == 204
    assert response.content == b""
    with pytest.raises(TokenError, match="blacklisted"):
        RefreshToken(token)


@pytest.mark.django_db
def test_logout_rejects_already_blacklisted_refresh(api_client, refresh_token):
    token = str(refresh_token)
    api_client.post(
        reverse("autenticacion:logout"),
        {"refresh": token},
        format="json",
    )

    response = api_client.post(
        reverse("autenticacion:logout"),
        {"refresh": token},
        format="json",
    )

    assert response.status_code == 400
    assert set(response.data) == {"refresh"}


@pytest.mark.django_db
@pytest.mark.parametrize("token", ["not-a-token", ""])
def test_logout_rejects_malformed_or_empty_refresh(api_client, token):
    response = api_client.post(
        reverse("autenticacion:logout"),
        {"refresh": token},
        format="json",
    )

    assert response.status_code == 400
    assert set(response.data) == {"refresh"}


@pytest.mark.django_db
def test_logout_rejects_expired_refresh(api_client, refresh_token):
    refresh_token.set_exp(
        from_time=timezone.now() - timedelta(days=2),
        lifetime=timedelta(days=1),
    )

    response = api_client.post(
        reverse("autenticacion:logout"),
        {"refresh": str(refresh_token)},
        format="json",
    )

    assert response.status_code == 400
    assert set(response.data) == {"refresh"}


@pytest.mark.django_db
def test_logout_rejects_access_token(api_client, user):
    access_token = AccessToken.for_user(user)

    response = api_client.post(
        reverse("autenticacion:logout"),
        {"refresh": str(access_token)},
        format="json",
    )

    assert response.status_code == 400
    assert set(response.data) == {"refresh"}


@pytest.mark.django_db
@pytest.mark.parametrize("payload", [{}, {"refresh": ""}])
def test_logout_rejects_missing_or_blank_refresh(api_client, payload):
    response = api_client.post(
        reverse("autenticacion:logout"),
        payload,
        format="json",
    )

    assert response.status_code == 400
    assert set(response.data) == {"refresh"}


def test_logout_is_documented_in_openapi_schema(api_client):
    response = api_client.get(reverse("schema"))

    assert response.status_code == 200
    operation = response.data["paths"]["/api/auth/logout/"]["post"]
    assert operation["description"] == (
        "Revoca el refresh token para cerrar la sesión actual."
    )
    assert set(operation["responses"]) == {"204", "400"}

    schemas = response.data["components"]["schemas"]
    request_schema = operation["requestBody"]["content"]["application/json"]["schema"]
    request_component = request_schema["$ref"].rsplit("/", maxsplit=1)[-1]
    assert set(schemas[request_component]["properties"]) == {"refresh"}
