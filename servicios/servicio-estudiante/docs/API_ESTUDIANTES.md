# DocumentaciÃ³n de API REST â€“ GestiÃ³n de Estudiantes

## 1. InformaciÃ³n general

**Nombre:** Microservicio de GestiÃ³n de Estudiantes
**Proyecto:** Universidad SOA
**TecnologÃ­a:** Java 21 y Spring Boot 4.1.2
**Base de datos:** MySQL 8.0
**Puerto:** 8082
**URL base:** `http://localhost:8082/api/estudiantes`

## 2. DescripciÃ³n

El microservicio de GestiÃ³n de Estudiantes permite administrar la informaciÃ³n acadÃ©mica y personal de los estudiantes mediante una API REST.

Su responsabilidad es registrar, consultar, actualizar y eliminar estudiantes, utilizando MySQL para almacenar la informaciÃ³n.

## 3. Endpoints REST

| OperaciÃ³n | MÃ©todo | Endpoint |
|---|---|---|
| Registrar estudiante | POST | `/api/estudiantes` |
| Listar estudiantes | GET | `/api/estudiantes` |
| Buscar por ID | GET | `/api/estudiantes/{id}` |
| Actualizar estudiante | PUT | `/api/estudiantes/{id}` |
| Eliminar estudiante | DELETE | `/api/estudiantes/{id}` |

## 4. Estructura de datos

Ejemplo de solicitud para registrar un estudiante:

```json
{
  "usuarioId": "USR001",
  "codigoEstudiante": "EST2026001",
  "dni": "12345678",
  "apellidos": "Vargas Perez",
  "telefono": "987654321",
  "fechaNacimiento": "2002-05-15",
  "direccion": "Lima, Peru",
  "carrera": "Ingenieria de Sistemas",
  "cicloActual": 9
}
```

## 5. Respuestas HTTP

| CÃ³digo | DescripciÃ³n |
|---|---|
| 200 | Solicitud procesada correctamente |
| 201 | Estudiante registrado |
| 204 | Estudiante eliminado |
| 400 | Solicitud incorrecta |
| 404 | Estudiante no encontrado |
| 500 | Error interno del servidor |

## 6. Pruebas realizadas

Se utilizÃ³ Postman para verificar las operaciones de la API:

- Registro de estudiantes mediante POST.
- Consulta general mediante GET.
- BÃºsqueda de estudiantes por ID.
- ActualizaciÃ³n de informaciÃ³n mediante PUT.
- EliminaciÃ³n mediante DELETE.

Se comprobÃ³ la persistencia de los datos mediante Hibernate y MySQL.

## 7. Arquitectura interna

El microservicio utiliza una arquitectura por capas:

- **Controller:** recibe las solicitudes HTTP.
- **Service:** contiene la lÃ³gica de negocio.
- **Repository:** realiza las operaciones de persistencia.
- **Model:** representa la entidad Estudiante.
- **DTO:** define los datos de entrada y salida.
- **Config:** contiene las configuraciones del microservicio.

## 8. EjecuciÃ³n

Desde la carpeta `servicio-estudiante`, ejecutar:

```bash
./mvnw spring-boot:run
```

En Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

El servicio se ejecuta en:

`http://localhost:8082`
