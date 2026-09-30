from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

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