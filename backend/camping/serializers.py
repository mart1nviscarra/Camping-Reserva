from rest_framework import serializers
from .models import Servicio
from datetime import date
from django.contrib.auth import get_user_model
from .models import Servicio, Reserva

User = get_user_model()


class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = [
            "id", "nombre", "descripcion", "capacidad",
            "precio", "tiene_electricidad", "activo", "creado_en",
        ]
        read_only_fields = ["id", "creado_en"]  # los genera el servidor

    # Validación a medida: se ejecuta automáticamente para el campo "precio"
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor que 0.")
        return value
class ReservaSerializer(serializers.ModelSerializer):
    servicio_nombre = serializers.CharField(source="servicio.nombre", read_only=True)
    usuario_username = serializers.CharField(source="usuario.username", read_only=True)
    usuario_email = serializers.CharField(source="usuario.email", read_only=True)

    class Meta:
        model = Reserva
        fields = [
            "id", "servicio", "servicio_nombre", "usuario_username", "usuario_email",
            "fecha_inicio", "fecha_fin", "estado", "creado_en",
        ]
        read_only_fields = ["id", "estado", "creado_en"]

    def validate_servicio(self, value):
        if not value.activo:
            raise serializers.ValidationError("Este servicio no está disponible.")
        return value

    def validate(self, datos):
        inicio, fin = datos["fecha_inicio"], datos["fecha_fin"]
        if fin <= inicio:
            raise serializers.ValidationError(
                {"fecha_fin": "La salida debe ser posterior a la llegada."})
        if inicio < date.today():
            raise serializers.ValidationError(
                {"fecha_inicio": "La llegada no puede ser en el pasado."})
        # Solapamiento: otra reserva confirmada del mismo servicio que choque con las fechas
        choque = Reserva.objects.filter(
            servicio=datos["servicio"], estado="confirmada",
            fecha_inicio__lt=fin, fecha_fin__gt=inicio,
        )
        if choque.exists():
            raise serializers.ValidationError(
                {"servicio": "Ya está reservado en esas fechas."})
        return datos


class UsuarioSerializer(serializers.ModelSerializer):
    es_admin = serializers.BooleanField(source="is_staff", read_only=True)
    total_reservas = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        # La contraseña nunca se expone
        fields = ["id", "username", "email", "es_admin", "date_joined", "total_reservas"]