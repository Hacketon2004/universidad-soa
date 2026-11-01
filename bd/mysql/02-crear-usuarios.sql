
-- Script de referencia para crear usuarios de desarrollo.
-- Sustituir las contraseñas de ejemplo antes de ejecutarlo.
-- No utilizar contraseñas reales en archivos subidos a GitHub.

CREATE USER IF NOT EXISTS 'svc_estudiantes'@'%'
IDENTIFIED BY 'CAMBIAR_CLAVE_ESTUDIANTES';

CREATE USER IF NOT EXISTS 'svc_cursos'@'%'
IDENTIFIED BY 'CAMBIAR_CLAVE_CURSOS';

CREATE USER IF NOT EXISTS 'svc_matriculas'@'%'
IDENTIFIED BY 'CAMBIAR_CLAVE_MATRICULAS';

GRANT ALL PRIVILEGES
ON universidad_estudiantes.*
TO 'svc_estudiantes'@'%';

GRANT ALL PRIVILEGES
ON universidad_cursos.*
TO 'svc_cursos'@'%';

GRANT ALL PRIVILEGES
ON universidad_matriculas.*
TO 'svc_matriculas'@'%';
