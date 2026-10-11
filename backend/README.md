# Backend

API de HabitSquad implementada con Django y Django REST Framework.

## Requisitos

- Python 3.12.x.
- Dependencias fijadas en `requirements.txt`.

## Preparar el entorno local

Desde la raíz del repositorio:

```bash
python3.12 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -r backend/requirements.txt
```

El entorno virtual contiene los paquetes del proyecto y no debe subirse al
repositorio; está excluido por el `.gitignore` raíz.

## Comandos de desarrollo

Desde `backend/` con el entorno virtual activado:

```bash
python manage.py migrate
python manage.py check
pytest --cov=usuarios --cov=autenticacion --cov-report=term-missing --cov-fail-under=100
ruff check .
ruff format --check .
python manage.py runserver
```

La configuración actual usa SQLite y está pensada para desarrollo. La clave
por defecto de Django es solo local; antes de cualquier despliegue se debe
definir `DJANGO_SECRET_KEY` mediante la configuración segura del entorno.

## API de registro

Con el servidor iniciado, la documentación interactiva de la API está
disponible en `http://127.0.0.1:8000/api/docs/` y el esquema OpenAPI en
`http://127.0.0.1:8000/api/schema/`.

El endpoint `POST /api/auth/register/` recibe `email` y `password`, y devuelve
`id`, `email` y `date_joined`. El endpoint limita las solicitudes anónimas a
cinco por hora y dirección IP.

El endpoint `POST /api/auth/token/` recibe `email` y `password` y devuelve
`access` y `refresh`. El token de acceso dura cinco minutos y el de renovación,
un día. Los intentos de inicio de sesión también están limitados a cinco por
hora y dirección IP.

## Usuario

La app `usuarios` contiene el modelo `CustomUser`, su configuración de
administración y sus pruebas. El modelo usa un ID `BigAutoField`, email único
normalizado a minúsculas como identificador y el manejo de contraseña hasheada
de Django. La migración inicial se creó después de configurar `AUTH_USER_MODEL`.

## Organización por funcionalidad

Cada funcionalidad de autenticación separa el transporte HTTP, la lógica de
aplicación y sus pruebas:

```text
autenticacion/
├── urls.py                     # Agrupa rutas de autenticación
└── registro/
    ├── api/                    # Endpoints, rutas y serializadores HTTP
    ├── services/               # Operaciones de aplicación y escritura de datos
    └── tests/                  # Pruebas de API y servicios

usuarios/
├── models/                     # Entidades persistentes compartidas
├── admin.py                   # Integración con Django Admin
└── tests/                      # Pruebas del modelo de usuario
```

El flujo de registro es `api/urls.py` → `api/views.py` →
`api/serializers.py` → `services/registration.py` → `usuarios.models`.
Las próximas funcionalidades de login, refresh y logout seguirán la misma
separación en subdirectorios propios. Solo tendrán modelos bajo
`usuarios/models/` si necesitan persistir nuevas entidades; no se duplicará
el modelo de usuario por cada operación de autenticación.