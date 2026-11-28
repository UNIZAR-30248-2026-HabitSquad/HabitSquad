import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("alertas", "0001_initial_suscripcion_push"),
        ("escuadrones", "0002_configuracion_escuadron"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Toque",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("fecha", models.DateField()),
                ("mensaje", models.TextField()),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                (
                    "destinatario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="toques_recibidos",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "escuadron",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="toques",
                        to="escuadrones.escuadron",
                    ),
                ),
                (
                    "remitente",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="toques_enviados",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "toque interpersonal",
                "verbose_name_plural": "toques interpersonales",
                "constraints": [
                    models.UniqueConstraint(
                        fields=("destinatario", "fecha"),
                        name="unique_toque_destinatario_fecha",
                    )
                ],
            },
        )
    ]
