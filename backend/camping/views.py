from django.contrib.auth import get_user_model
from django.db.models import Count, ProtectedError, Q
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Servicio, Reserva
from .permissions import EsAdminOLectura
from .serializers import ServicioSerializer, ReservaSerializer, UsuarioSerializer

User = get_user_model()


class ServicioViewSet(viewsets.ModelViewSet):
    """Todos leen, solo el admin modifica. El cliente ve solo los activos."""
    serializer_class = ServicioSerializer
    permission_classes = [EsAdminOLectura]

    def get_queryset(self):
        qs = Servicio.objects.all()
        if not self.request.user.is_staff:
            qs = qs.filter(activo=True)   # disponibles
        return qs

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            # Sin esto sería un 500
            return Response(
                {"detail": "No se puede eliminar: tiene reservas. Márcalo como inactivo."},
                status=409,
            )


class ReservaViewSet(viewsets.ModelViewSet):
    """El cliente ve y crea las suyas; el admin ve todas."""
    serializer_class = ReservaSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        qs = Reserva.objects.select_related("servicio", "usuario")
        user = self.request.user
        return qs if user.is_staff else qs.filter(usuario=user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)   # el usuario sale del token

    @action(detail=True, methods=["post"])
    def cancelar(self, request, pk=None):
        reserva = self.get_object()   # un cliente no encuentra reservas ajenas (404)
        reserva.estado = "cancelada"
        reserva.save()
        return Response(self.get_serializer(reserva).data)


class UsuarioViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Solo admin: lista, detalle y eliminación. 401 sin token, 403 si es cliente."""
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.annotate(
        total_reservas=Count("reservas", filter=Q(reservas__estado="confirmada"))
    ).order_by("username")

    def destroy(self, request, *args, **kwargs):
        usuario = self.get_object()  # 404 si no existe
        if usuario == request.user:
            return Response(
                {"detail": "No puedes eliminar tu propia cuenta."}, status=400
            )
        if usuario.is_staff:
            return Response(
                {"detail": "No se pueden eliminar administradores desde aquí."},
                status=403,
            )
        return super().destroy(request, *args, **kwargs)  # 204