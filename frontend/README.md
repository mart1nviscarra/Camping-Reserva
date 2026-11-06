## Integración React + Django

### 1. Arquitectura

```
React (localhost:5173) --/api/*--> Vite (proxy) --> Django (127.0.0.1:8000) --> SQLite
```

El navegador solo habla con Vite. Vite reenvía toda petición que empiece con `/api` a Django, que la valida con el serializer, la guarda con el ORM y responde JSON.

### 2. Contrato de la API

| Acción | Método | URL | Códigos |
|---|---|---|---|
| Listar | GET | `/api/servicios/` | 200 |
| Crear | POST | `/api/servicios/` | 201 (400 si es inválido) |
| Editar | PUT | `/api/servicios/<id>/` | 200 (400 si es inválido) |
| Eliminar | DELETE | `/api/servicios/<id>/` | 204 |

Ejemplo de JSON de un servicio:

```json
{
  "id": 3,
  "nombre": "Cabaña familiar",
  "descripcion": "Cabaña equipada con 2 habitaciones, cocina, baño privado y terraza con parrilla.",
  "capacidad": 8,
  "precio": "65000",
  "tiene_electricidad": true,
  "activo": true,
  "creado_en": "2026-09-29T23:31:41.777113-03:00"
}
```

### 3. Configuración de Django

- Paquetes agregados: `djangorestframework` y `django-cors-headers` (en `requirements.txt`).
- En `settings.py`: `rest_framework` y `corsheaders` en `INSTALLED_APPS`, y `corsheaders.middleware.CorsMiddleware` en `MIDDLEWARE` antes de `CommonMiddleware`.
- Orígenes CORS permitidos: `http://localhost:5173` y `http://127.0.0.1:5173`.
- App `camping`: `serializers.py` (`ServicioSerializer` con validación de precio), `views.py` (`ServicioViewSet`) y `urls.py` (`DefaultRouter`).

### 4. Configuración de React

- Proxy en `frontend/vite.config.js`: `/api` apunta a `http://127.0.0.1:8000`.
- `src/api/client.js`: módulo único con `fetch`, manejo de `ok`, errores de validación y respuesta 204.
- Componentes: `App.jsx` (estado), `ServicioList.jsx` (tabla y acciones) y `ServicioForm.jsx` (crear y editar).

### 5. Cómo ejecutar el proyecto

1. Clonar el repositorio y entrar a la carpeta.
2. **Terminal 1 (backend):**
   ```
   cd backend
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```
   Disponible en http://127.0.0.1:8000
3. **Terminal 2 (frontend):**
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Disponible en http://localhost:5173
4. Opcional: `python manage.py createsuperuser` para entrar a http://127.0.0.1:8000/admin/

### 6. Decisiones y problemas resueltos

- **Estrategia:** usamos el proxy de Vite con rutas relativas y dejamos CORS configurado como respaldo. El proxy solo existe en desarrollo; en producción haría falta CORS o servir el build desde Django.
- **`TemplateDoesNotExist: rest_framework/api.html`:** faltaba `rest_framework` en `INSTALLED_APPS`.
- **Error CORS:** el navegador bloqueaba la lectura aunque Django respondía 200. Se resolvió con `django-cors-headers`.
- **Error 500 en `App.jsx`:** contenido anterior que no compilaba; se reemplazó el archivo completo.
- **`git push` sin upstream:** se usó `git push --set-upstream origin feature/integracion-react-django`.


