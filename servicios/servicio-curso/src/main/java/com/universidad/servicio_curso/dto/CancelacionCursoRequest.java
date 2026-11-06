package com.universidad.servicio_curso.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CancelacionCursoRequest {

    @NotBlank(message = "El motivo de cancelación es obligatorio")
    @Size(min = 10, max = 500, message = "El motivo debe tener entre 10 y 500 caracteres")
    private String motivo;

    @NotBlank(message = "Debe indicar el usuario o área responsable de la cancelación")
    private String canceladoPor;

    public CancelacionCursoRequest() {
    }

    public CancelacionCursoRequest(String motivo, String canceladoPor) {
        this.motivo = motivo;
        this.canceladoPor = canceladoPor;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getCanceladoPor() {
        return canceladoPor;
    }

    public void setCanceladoPor(String canceladoPor) {
        this.canceladoPor = canceladoPor;
    }
}
