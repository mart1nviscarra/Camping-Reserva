from rest_framework.permissions import BasePermission, SAFE_METHODS


class EsAdminOLectura(BasePermission):
    """Cualquier usuario autenticado puede leer; solo el admin puede modificar."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False  # sin token -> 401
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_staff 