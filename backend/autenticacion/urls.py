from django.urls import include, path

app_name = "autenticacion"

urlpatterns = [
    path("", include("autenticacion.registro.api.urls")),
]
