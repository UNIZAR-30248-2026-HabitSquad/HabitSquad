from django.urls import include, path

app_name = "escuadrones"

urlpatterns = [
    path("", include("escuadrones.crear.api.urls")),
]
