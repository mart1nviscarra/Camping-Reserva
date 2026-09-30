from django.contrib import admin
from .models import Servicio

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ("nombre", "precio", "activo", "creado_en") # columnas del listado
    list_filter = ("activo",) # filtro lateral
    search_fields = ("nombre",) # barra de búsqueda