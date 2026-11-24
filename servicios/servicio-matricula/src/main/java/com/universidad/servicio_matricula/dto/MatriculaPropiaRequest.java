package com.universidad.servicio_matricula.dto;

import jakarta.validation.constraints.NotNull;

// Lo que envia el estudiante al matricularse: solo el curso.
// Quien es el estudiante sale del token y el periodo lo fija el servidor.
public record MatriculaPropiaRequest(

        @NotNull(message = "El cursoId es obligatorio")
        Long cursoId
) {
}
