from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
class Servicio(models.Model):

    nombre = models.CharField(max_length=100) # texto corto
    descripcion = models.TextField(blank=True) # texto largo, opcional
    capacidad = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(50)])
    precio= models.DecimalField(max_digits=10, decimal_places=0)# CLP no usa decimales
    tiene_electricidad = models.BooleanField(default=True) # si tiene o no electricidad
    activo = models.BooleanField(default=True) # visible u oculto
    creado_en = models.DateTimeField(auto_now_add=True) # se llena solo al crear

    class Meta:
        ordering = ["nombre"] # orden por defecto de las consultas
        verbose_name_plural = "servicios" # cómo se ve en el admin
    def __str__(self):

     return self.nombre
    
class Reserva(models.Model):
    ESTADOS = [("confirmada", "Confirmada"), ("cancelada", "Cancelada")]

    # PROTECT: no se puede borrar un servicio que tiene reservas
    servicio = models.ForeignKey(Servicio, on_delete=models.PROTECT, related_name="reservas")
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservas")
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=10, choices=ESTADOS, default="confirmada")
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-creado_en"]

    def __str__(self):
        return f"{self.servicio} - {self.usuario} ({self.fecha_inicio})"   