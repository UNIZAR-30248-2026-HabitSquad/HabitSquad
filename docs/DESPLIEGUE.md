# Despliegue en producción

HabitSquad se despliega en una máquina virtual de Azure (Azure for Students)
con Docker Compose. Caddy sirve el frontend, hace de proxy hacia Django y
obtiene y renueva solo el certificado HTTPS de Let's Encrypt.

URL de producción: <https://habitsquad.austriaeast.cloudapp.azure.com>

## Máquina virtual

| Elemento | Valor |
| --- | --- |
| Suscripción | Azure for Students |
| Grupo de recursos | `habitsquad-rg` |
| Región | Austria Este (`austriaeast`) |
| Máquina | `habitsquad-vm`, Ubuntu 24.04 LTS, `Standard_B2ats_v2` (2 vCPU, 1 GB) |
| Disco | Standard SSD de 30 GB |
| Swap | 2 GB en `/swapfile` |
| Usuario | `habitsquad`, solo con clave SSH |
| Puertos abiertos | 22, 80 y 443 |

La suscripción de estudiante solo permite desplegar en Italia Norte, Suecia
Central, Polonia Central, Austria Este y Suiza Norte. `Standard_B1s` no está
disponible para la suscripción en ninguna de ellas; `Standard_B2ats_v2` tiene
la misma memoria y también entra en las horas gratuitas de Azure for Students.

Para la demo se puede ampliar temporalmente la memoria sin perder datos:

```bash
az vm deallocate -g habitsquad-rg -n habitsquad-vm
az vm resize -g habitsquad-rg -n habitsquad-vm --size Standard_B2als_v2
az vm start -g habitsquad-rg -n habitsquad-vm
```

## Servicios

| Servicio | Imagen | Función |
| --- | --- | --- |
| `db` | `postgres:18.6-alpine` | Base de datos, con los datos en el volumen `postgres-data`. |
| `api` | `backend/Dockerfile` | Django sobre uvicorn (ASGI). Al arrancar aplica las migraciones y ejecuta `collectstatic`. |
| `web` | `frontend/Dockerfile` | Build de Vite servido por Caddy, con HTTPS. |

Caddy reparte las peticiones según el `Caddyfile`:

- `/api/` y `/admin/` van a Django.
- `/static/` sirve los estáticos de Django.
- El resto sirve el frontend; si la ruta no es un archivo, responde con
  `index.html` para que funcione el enrutador del cliente.

## Variables de entorno

El `.env` de producción solo existe en la máquina, en `~/habitsquad/.env`, con
permisos `600`. Las variables están descritas en `.env.example`. La clave de
Django y la contraseña de PostgreSQL se generaron aleatoriamente en el
servidor y no están en el repositorio.

Sin `POSTGRES_DB`, Django sigue usando SQLite, así que el desarrollo local no
cambia.

## Desplegar a mano

Desde la máquina virtual, en `~/habitsquad` y con el código actualizado:

```bash
docker compose build api
docker compose build web
docker compose up -d
```

Las imágenes se construyen de una en una para no agotar la memoria.

Comprobaciones:

```bash
docker compose ps
docker compose logs --tail 50 api
curl -I https://habitsquad.austriaeast.cloudapp.azure.com
```

## Operación

```bash
ssh -i ~/.ssh/habitsquad_azure habitsquad@habitsquad.austriaeast.cloudapp.azure.com
docker compose exec api python manage.py createsuperuser
docker compose exec db psql -U habitsquad -d habitsquad
```

La máquina debe seguir encendida hasta la entrega final: si se apaga, Caddy no
puede renovar el certificado.
