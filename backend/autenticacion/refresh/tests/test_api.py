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
def test_refresh_rotates_tokens_and_blacklists_previous_token(
    api_client,
    refresh_token,
    user,
):
    old_refresh = str(refresh_token)

    response = api_client.post(
        reverse("autenticacion:refresh"),
        {"refresh": old_refresh},
        format="json",
    )

    assert response.status_code == 200
    assert set(response.data) == {"access", "refresh"}
    assert response.data["refresh"] != old_refresh

    new_access = AccessToken(response.data["access"])
    new_refresh = RefreshToken(response.data["refresh"])
    assert new_access["user_id"] == str(user.pk)
    assert new_refresh["user_id"] == str(user.pk)

    with pytest.raises(TokenError, match="blacklisted"):
        RefreshToken(old_refresh)

    retry_response = api_client.post(
        reverse("autenticacion:refresh"),
        {"refresh": old_refresh},
        format="json",
    )
    assert retry_response.status_code == 401


@pytest.mark.django_db
def test_refresh_rejects_invalid_token_with_401(api_client):
    response = api_client.post(
        reverse("autenticacion:refresh"),
        {"refresh": "not-a-token"},
        format="json",
    )

    assert response.status_code == 401
    assert set(response.data) == {"detail", "code"}


@pytest.mark.django_db
def test_refresh_rejects_expired_token(api_client, refresh_token):
    refresh_token.set_exp(
        from_time=timezone.now() - timedelta(days=2),
        lifetime=timedelta(days=1),
    )

    response = api_client.post(
        reverse("autenticacion:refresh"),
        {"refresh": str(refresh_token)},
        format="json",
    )

    assert response.status_code == 401


@pytest.mark.django_db
@pytest.mark.parametrize("payload", [{}, {"refresh": ""}])
def test_refresh_rejects_missing_token_with_400(api_client, payload):
    response = api_client.post(
        reverse("autenticacion:refresh"),
        payload,
        format="json",
    )

    assert response.status_code == 400
    assert set(response.data) == {"refresh"}


def test_refresh_is_documented_in_openapi_schema(api_client):
    response = api_client.get(reverse("schema"))

    assert response.status_code == 200
    operation = response.data["paths"]["/api/auth/token/refresh/"]["post"]
    assert operation["description"] == (
        "Renueva el par de tokens y revoca el refresh anterior."
    )
    assert set(operation["responses"]) == {"200", "400", "401"}

    schemas = response.data["components"]["schemas"]
    request_schema = operation["requestBody"]["content"]["application/json"]["schema"]
    request_component = request_schema["$ref"].rsplit("/", maxsplit=1)[-1]
    assert set(schemas[request_component]["properties"]) == {"refresh"}

    response_schema = operation["responses"]["200"]["content"]["application/json"][
        "schema"
    ]
    response_component = response_schema["$ref"].rsplit("/", maxsplit=1)[-1]
    assert set(schemas[response_component]["properties"]) == {"access", "refresh"}
