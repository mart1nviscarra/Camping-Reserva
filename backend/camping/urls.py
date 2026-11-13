from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ServicioViewSet, ReservaViewSet, UsuarioViewSet
from . import auth_views

router = DefaultRouter()
router.register("servicios", ServicioViewSet, basename="servicio")
router.register("reservas", ReservaViewSet, basename="reserva")
router.register("usuarios", UsuarioViewSet, basename="usuario")

urlpatterns = [
    path("auth/login/", auth_views.login),
    path("auth/registro/", auth_views.registro),
    path("auth/logout/", auth_views.logout),
] + router.urls