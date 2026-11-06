from rest_framework import viewsets
from .models import Servicio
from .serializers import ServicioSerializer


class ServicioViewSet(viewsets.ModelViewSet):
    """CRUD completo de Servicio: listar, crear, ver, editar y eliminar."""
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer