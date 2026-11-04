package com.universidad.servicio_matricula.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MatriculaRequest(

        @NotNull(message = "El estudianteId es obligatorio")
        Long estudianteId,

        @NotNull(message = "El cursoId es obligatorio")
        Long cursoId,

        @NotBlank(message = "El periodo es obligatorio")
        String periodo
) {
}