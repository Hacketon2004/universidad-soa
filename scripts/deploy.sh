#!/bin/sh
# Despliegue de produccion: trae main y reconstruye los servicios de a uno.
set -e
cd "$HOME/universidad-soa"

echo ">> Actualizando codigo"
git fetch origin main
git merge --ff-only origin/main

# Sin "provenance": un build sin cambios produce la misma imagen y no reinicia el servicio
export BUILDX_NO_DEFAULT_ATTESTATIONS=1
COMPOSE="docker compose -f docker-compose.prod.yml"

for servicio in servicio-autenticacion servicio-estudiante servicio-curso servicio-financiero servicio-matricula api-gateway; do
  echo ">> Construyendo $servicio"
  $COMPOSE build "$servicio"
done

echo ">> Levantando contenedores"
$COMPOSE up -d

echo ">> Limpiando imagenes viejas"
docker image prune -f

$COMPOSE ps
echo ">> Despliegue terminado: $(git log --oneline -1)"
