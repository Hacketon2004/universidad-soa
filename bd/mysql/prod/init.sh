#!/bin/sh
# Crea (si no existen) las bases de datos y usuarios de los servicios MySQL.
# Se ejecuta en cada "docker compose up": es seguro repetirlo, no borra nada.
set -e

echo "mysql-init: creando bases de datos y usuarios..."

mysql -h mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS universidad_estudiantes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS universidad_cursos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'svc_estudiantes'@'%' IDENTIFIED BY '${DB_ESTUDIANTE_PASSWORD}';
ALTER USER 'svc_estudiantes'@'%' IDENTIFIED BY '${DB_ESTUDIANTE_PASSWORD}';
GRANT ALL PRIVILEGES ON universidad_estudiantes.* TO 'svc_estudiantes'@'%';

CREATE USER IF NOT EXISTS 'svc_cursos'@'%' IDENTIFIED BY '${DB_CURSO_PASSWORD}';
ALTER USER 'svc_cursos'@'%' IDENTIFIED BY '${DB_CURSO_PASSWORD}';
GRANT ALL PRIVILEGES ON universidad_cursos.* TO 'svc_cursos'@'%';
SQL

echo "mysql-init: listo"
