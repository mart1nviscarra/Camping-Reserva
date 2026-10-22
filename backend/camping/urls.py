from django.urls import path
from . import views

urlpatterns = [
path("servicios/", views.servicio_list, name="servicio-list"),
]
