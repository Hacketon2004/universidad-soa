<CodeBlock language="markdown" editable>
# Guía de desarrollo de microservicios

1. Arquitectura del sistema
   Proyecto universitario basado en arquitectura SOA.

Tecnologías principales:

- Java 21
- Spring Boot
- Maven
- Spring Cloud Gateway
- Docker Compose
- MongoDB, MySQL y PostgreSQL
- Autenticación JWT
- API REST con JSON

2. Distribución de microservicios
   Servicio Puerto Base de datos Ruta
   Autenticación 8081 MongoDB /api/auth/**
   Estudiantes 8082 MySQL /api/estudiantes/**
   Cursos 8083 MySQL /api/cursos/**
   Financiero 8084 PostgreSQL /api/finanzas/**
   Matrícula 8085 MySQL /api/matriculas/\*\*

API Gateway: http://localhost:8080

Todas las solicitudes externas deberán utilizar el Gateway. 3. Organización interna de cada servicio
src/main/java/com/universidad/nombre_servicio/
controller/
service/
repository/
model/
dto/
config/

Responsabilidades:

- controller: recibe las solicitudes HTTP.
- service: contiene la lógica de negocio.
- repository: accede a la base de datos.
- model: representa las entidades.
- dto: define los datos de entrada y salida.
- config: contiene configuraciones del servicio.

4. Reglas para los desarrolladores
1. Cada integrante trabaja en su propio microservicio.
1. No modificar el código de otros servicios sin coordinación.
1. Utilizar el puerto asignado.
1. Mantener las rutas REST acordadas.
1. No almacenar contraseñas ni secretos en GitHub.
1. Utilizar variables de entorno para credenciales.
1. No subir carpetas target.
1. Crear una rama feature/nombre-servicio.
1. Integrar los cambios mediante Pull Requests.
1. Documentar los endpoints implementados.
1. Autenticación JWT
   El servicio de autenticación dispone de:

POST /api/auth/registro
POST /api/auth/login
GET /api/auth/perfil
GET /api/auth/validar

Los endpoints protegidos requieren:

Authorization: Bearer TOKEN_JWT

El endpoint /api/auth/validar devuelve:

- valido
- usuarioId
- rol
  Importante: el endpoint de validación no protege
  automáticamente los demás microservicios.

Cada servicio deberá implementar la verificación de
autenticación y autorización que se acuerde durante
la integración.

No se debe confiar en un usuarioId o rol enviado
libremente por el cliente. 6. Bases de datos
MongoDB:

- Servicio de autenticación.

MySQL:

- Servicio de estudiantes.
- Servicio de cursos.
- Servicio de matrícula.
  PostgreSQL:

- Servicio financiero.

Los servicios que comparten MySQL deberán utilizar
esquemas o bases de datos separados, o una separación
de tablas claramente definida.

Ningún microservicio debe modificar directamente
las tablas pertenecientes a otro microservicio. 7. Comunicación entre servicios
La comunicación inicial será mediante API REST.

El servicio de matrícula necesitará consultar:

- Estudiantes: existencia y estado del estudiante.
- Cursos: disponibilidad y cupos.
- Financiero: estado de pagos y deudas.
  Los contratos de estas consultas deberán acordarse
  antes de desarrollar las integraciones.

8. Pruebas mínimas
   Cada integrante deberá comprobar:

- Inicio correcto de su servicio.
- Conexión a su base de datos.
- Operaciones CRUD correspondientes.
- Validación de datos de entrada.
- Respuestas HTTP correctas.
- Manejo de errores.
- Acceso mediante el API Gateway.
- Protección de endpoints privados.

9. Entrega de cada integrante
   Cada integrante deberá entregar:

- Código fuente funcional.
- Configuración de base de datos.
- Endpoints documentados.
- Ejemplos de solicitudes y respuestas JSON.
- Evidencia de pruebas.
- Pull Request hacia main.
  </CodeBlock>
