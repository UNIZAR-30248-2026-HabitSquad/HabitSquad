#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# La VM solo tiene 1 GB de RAM: construir una imagen cada vez evita
# que los builds de Python y Node compitan por la memoria.
docker compose config --quiet
docker compose build api
docker compose build web
docker compose up -d --remove-orphans

# El arranque de la API aplica las migraciones antes de iniciar uvicorn.
for attempt in {1..30}; do
  frontend_status="$(curl --silent --output /dev/null --write-out "%{http_code}" \
    https://habitsquad.austriaeast.cloudapp.azure.com/ || true)"
  api_status="$(curl --silent --output /dev/null --write-out "%{http_code}" \
    https://habitsquad.austriaeast.cloudapp.azure.com/admin/ || true)"

  if [[ "$frontend_status" == "200" && "$api_status" == "302" ]]; then
    docker image prune --force
    docker compose ps
    exit 0
  fi

  sleep 2
done

docker compose logs --tail 100 api web
echo "La comprobación HTTPS del despliegue ha fallado." >&2
exit 1
