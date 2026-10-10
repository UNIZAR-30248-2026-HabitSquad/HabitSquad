# Dependencias y runtimes

Este documento registra los runtimes y las dependencias acordados para que el
equipo pueda reproducir el entorno. Cada cambio de versiones o incorporación
de paquetes debe reflejarse aquí.

## Runtimes

| Área | Versión objetivo | Estado |
| --- | --- | --- |
| Backend | Python 3.12.x | Instalado y probado localmente con Python 3.12.3 en `backend/.venv`. |
| Frontend | Node.js 20.x y npm | Acordado como runtime objetivo; la versión exacta y la instalación se documentarán al preparar el frontend. |
| CI | GitHub Actions | El workflow fija `actions/checkout@v7.0.1` y `actions/setup-python@v7.0.0`. El primer workflow de dependencias pasó; el workflow ampliado con pruebas debe validarse al subir estos cambios. |

## Backend

El alcance inicial de [backend/requirements.txt](../backend/requirements.txt)
cubre la infraestructura y los PBI #01 y #02. Incluye versiones exactas de las
dependencias directas y transitivas para reproducir la resolución comprobada
con Python 3.12.3 el 10-10-2026.

### Dependencias principales

| Paquete | Versión | Propósito |
| --- | --- | --- |
| Django | 5.2.18 | Framework del backend; línea 5.2 LTS dentro del Django 5 acordado. |
| djangorestframework | 3.18.3 | API REST. |
| djangorestframework-simplejwt | 5.5.1 | Autenticación JWT. |
| drf-spectacular | 0.30.0 | Generación de documentación OpenAPI. |
| pytest | 9.1.1 | Ejecución de pruebas. |
| pytest-django | 4.14.0 | Integración de pytest con Django. |
| pytest-cov | 7.1.0 | Informes de cobertura para pytest. |
| ruff | 0.17.0 | Lint y formato del código Python. |

### Resolución completa fijada

Además de los paquetes principales, el manifiesto fija las dependencias
transitivas que resolvió pip:

| Paquete | Versión |
| --- | --- |
| PyJWT | 2.15.1 |
| PyYAML | 6.0.3 |
| Pygments | 2.21.0 |
| asgiref | 3.12.1 |
| attrs | 26.1.0 |
| coverage | 7.16.2 |
| inflection | 0.5.1 |
| iniconfig | 2.3.1 |
| jsonschema | 4.26.0 |
| jsonschema-specifications | 2025.9.1 |
| packaging | 26.3 |
| pluggy | 1.6.0 |
| referencing | 0.37.0 |
| rpds-py | 2026.9.1 |
| sqlparse | 0.6.0 |
| typing_extensions | 4.16.0 |
| uritemplate | 4.2.0 |

Las dependencias de otras áreas previstas por la arquitectura —como Channels,
Redis, Django Q2, Cloudinary y Web Push— se incorporarán cuando se trabaje en
las fases correspondientes, con sus versiones y cambios documentados.

### Instalación local

Desde la raíz del repositorio, en un sistema con soporte para entornos
virtuales de Python 3.12:

```bash
python3.12 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -r backend/requirements.txt
```

Para confirmar las versiones instaladas:

```bash
python --version
python -m django --version
pytest --version
coverage --version
ruff --version
```

La instalación se debe realizar en el entorno virtual, no sobre los paquetes
globales del sistema.

### Estado de validación

- **Instalación local comprobada:** las dependencias se instalaron en
  `backend/.venv` con Python 3.12.3. Django 5.2.18, pytest 9.1.1, coverage
  7.16.2 y Ruff 0.17.0 arrancan correctamente.
- **Backend comprobado localmente:** `manage.py check`, migraciones SQLite y
  consistencia de migraciones pasan; los 10 tests del paquete `usuarios`
  pasan con 100 % de cobertura.
- **CI pendiente de validar con estos cambios:** GitHub Actions debe volver a
  ejecutar instalación, Ruff, checks Django, migraciones y tests después del
  push que incluya el workflow ampliado.
- **Entorno local:** el entorno virtual `backend/.venv` está ignorado por Git.
  No se instalaron paquetes en el Python global del sistema.

## Frontend

Las dependencias de JavaScript se concretarán al preparar el frontend. En esa
fase se registrarán las versiones exactas en `frontend/package.json` y se
mantendrá el lockfile de npm para instalaciones reproducibles con `npm ci`.
También se actualizará este documento con las versiones de Node.js, npm y los
paquetes que se hayan verificado.
