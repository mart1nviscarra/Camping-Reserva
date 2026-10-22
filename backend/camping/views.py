from django.http import JsonResponse
from .models import Servicio

def servicio_list(request):
# .values() entrega cada fila como diccionario {campo: valor}.
# Elegimos los campos a exponer: nunca publiques más de lo necesario.
    servicios = list(
    Servicio.objects.filter(activo=True).values(
    "id", "nombre", "descripcion", "precio", "capacidad", "tiene_electricidad"
    )) # list() fuerza la ejecución de la consulta (QuerySet perezoso)
# Se envuelve la lista en un objeto para poder agregar metadatos después
    return JsonResponse({"count": len(servicios), "results": servicios})
