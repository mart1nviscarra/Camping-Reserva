from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

User = get_user_model()


def respuesta_sesion(user):
    token, _ = Token.objects.get_or_create(user=user)
    return {
        "token": token.key,
        "usuario": {"id": user.id, "username": user.username, "es_admin": user.is_staff},
    }


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, datos):
        # create_user guarda la contraseña con hash
        return User.objects.create_user(**datos)


@api_view(["POST"])
@authentication_classes([])          # evita que un token viejo rompa el login
@permission_classes([AllowAny])
def login(request):
    user = authenticate(
        username=request.data.get("username"),
        password=request.data.get("password"),
    )
    if user is None:
        return Response(
            {"detail": "Usuario o contraseña incorrectos."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response(respuesta_sesion(user))


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def registro(request):
    """Crea un usuario CLIENTE (is_staff=False). El admin se crea con createsuperuser."""
    serializer = RegistroSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)   # 400 con detalle por campo
    serializer.save()
    return Response(status=status.HTTP_201_CREATED)


@api_view(["POST"])
def logout(request):
    request.user.auth_token.delete()   # el token deja de servir
    return Response(status=status.HTTP_204_NO_CONTENT)