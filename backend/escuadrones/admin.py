from django.contrib import admin

from .models import Escuadron, Membresia


class MembresiaInline(admin.TabularInline):
    model = Membresia
    extra = 0


@admin.register(Escuadron)
class EscuadronAdmin(admin.ModelAdmin):
    list_display = ("nombre", "codigo_invitacion", "creador", "creado_en")
    search_fields = ("nombre", "codigo_invitacion", "creador__email")
    readonly_fields = ("codigo_invitacion", "creado_en")
    inlines = (MembresiaInline,)


@admin.register(Membresia)
class MembresiaAdmin(admin.ModelAdmin):
    list_display = ("escuadron", "usuario", "es_administrador", "unido_en")
    list_filter = ("es_administrador",)
    search_fields = ("escuadron__nombre", "usuario__email")
