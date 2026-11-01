# Configuración de bases de datos

## 1. Microservicio de Estudiantes

Puerto: 8082
Base de datos: universidad_estudiantes
Usuario: svc_estudiantes

Archivo: servicio-estudiante/src/main/resources/application.properties

```properties
spring.application.name=servicio-estudiante
server.port=8082

spring.datasource.url=jdbc:mysql://localhost:3306/universidad_estudiantes
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## 2. Microservicio de Cursos

Puerto: 8083
Base de datos: universidad_cursos
Usuario: svc_cursos

Archivo: servicio-curso/src/main/resources/application.properties

```properties
spring.application.name=servicio-curso
server.port=8083

spring.datasource.url=jdbc:mysql://localhost:3306/universidad_cursos
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## 3. Microservicio Financiero

Puerto: 8084
Base de datos: universidad_financiera
Motor: PostgreSQL

```properties
spring.application.name=servicio-financiero
server.port=8084

spring.datasource.url=jdbc:postgresql://localhost:5432/universidad_financiera
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## 4. Microservicio de Matrícula

Puerto: 8085
Base de datos: universidad_matriculas
Usuario: svc_matriculas

```properties
spring.application.name=servicio-matricula
server.port=8085

spring.datasource.url=jdbc:mysql://localhost:3306/universidad_matriculas
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## 5. Variables de entorno

Cada desarrollador debe configurar en su propia terminal:

DB_USERNAME
DB_PASSWORD

Ejemplo en PowerShell:

$env:DB_USERNAME = "svc_estudiantes"
$env:DB_PASSWORD = "CONTRASENA_LOCAL"

Las variables deben configurarse antes de iniciar Spring Boot
en esa misma terminal.

Nunca subir contraseñas a GitHub.

## 6. Requisitos

Cada microservicio necesita:

- Java 21.
- Spring Boot.
- Spring Data JPA.
- Driver MySQL o PostgreSQL según corresponda.
- Base de datos creada.
- Credenciales configuradas.

## 7. Consideraciones

- Las conexiones localhost funcionan cuando Spring Boot
  se ejecuta directamente en Windows.
- Si el microservicio se ejecuta dentro de Docker,
  deberá utilizar el nombre del servicio de base de datos,
  como mysql o postgres, en lugar de localhost.
- ddl-auto=update es únicamente para desarrollo inicial.
- Los usuarios y las bases de datos deben crearse
  también en el entorno local de cada integrante.

```

```
