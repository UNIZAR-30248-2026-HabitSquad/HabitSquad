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
pytest --cov=usuarios --cov-report=term-missing --cov-fail-under=100
ruff check .
ruff format --check .
python manage.py runserver
```

La configuración actual usa SQLite y está pensada para desarrollo. La clave
por defecto de Django es solo local; antes de cualquier despliegue se debe
definir `DJANGO_SECRET_KEY` mediante la configuración segura del entorno.

## Usuario

El usuario personalizado está en la app `usuarios`. Usa un ID
`BigAutoField`, email único normalizado a minúsculas como identificador de
autenticación y el manejo de contraseña hasheada de Django. La migración
inicial se creó después de configurar `AUTH_USER_MODEL`.