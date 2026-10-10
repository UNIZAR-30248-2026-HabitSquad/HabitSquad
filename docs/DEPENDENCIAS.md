# Dependencias y runtimes

Este documento registra los runtimes y las dependencias acordados para que el
equipo pueda reproducir el entorno. Cada cambio de versiones o incorporación
de paquetes debe reflejarse aquí.

## Runtimes

| Área | Versión objetivo | Estado |
| --- | --- | --- |
| Backend | Python 3.12.x | La resolución de dependencias se comprobó con Python 3.12.3. La instalación y ejecución quedan pendientes del punto de validación de startup. |
| Frontend | Node.js 20.x y npm | Acordado como runtime objetivo; la versión exacta y la instalación se documentarán al preparar el frontend. |
| CI | GitHub Actions | El workflow inicial fija `actions/checkout@v7.0.1` y `actions/setup-python@v7.0.0`; instalación real pendiente de ejecutar en GitHub Actions. |

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
globales del sistema. Los tests y checks propios del backend se añadirán a esta
guía cuando exista la aplicación y estén configurados sus runners.

### Estado de validación

- **Comprobado:** pip resolvió todas las versiones fijadas y encontró las
  distribuciones necesarias usando Python 3.12.3. La comprobación se hizo con
  `--dry-run`; no instaló paquetes.
- **Pendiente en CI:** instalar el manifiesto con Python 3.12 y ejecutar las
  herramientas cuando se configure GitHub Actions. El workflow debe cubrir
  también los cambios de startup integrados directamente en `main`.
- **Entorno local:** para desarrollar y ejecutar Django se recomienda instalar
  las dependencias en `backend/.venv`. La imagen de desarrollo usada para esta
  preparación no incluye `ensurepip`; se habilitará soporte para crear ese
  entorno cuando sea necesario para el trabajo local.
- **Pendiente hasta inicializar Django:** ejecutar los tests, la cobertura y
  los checks de la aplicación. No se consideran validados solo por resolver
  las dependencias.

## Frontend

Las dependencias de JavaScript se concretarán al preparar el frontend. En esa
fase se registrarán las versiones exactas en `frontend/package.json` y se
mantendrá el lockfile de npm para instalaciones reproducibles con `npm ci`.
También se actualizará este documento con las versiones de Node.js, npm y los
paquetes que se hayan verificado.
