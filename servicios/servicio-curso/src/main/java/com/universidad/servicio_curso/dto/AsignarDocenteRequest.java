package com.universidad.servicio_curso.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AsignarDocenteRequest {

    @NotNull(message = "El id del docente es obligatorio")
    private Long docenteId;

    @NotBlank(message = "El nombre del docente es obligatorio")
    private String docenteNombre;

    private String docenteCorreo;

    public AsignarDocenteRequest() {
    }

    public AsignarDocenteRequest(Long docenteId, String docenteNombre, String docenteCorreo) {
        this.docenteId = docenteId;
        this.docenteNombre = docenteNombre;
        this.docenteCorreo = docenteCorreo;
    }

    public Long getDocenteId() {
        return docenteId;
    }

    public void setDocenteId(Long docenteId) {
        this.docenteId = docenteId;
    }

    public String getDocenteNombre() {
        return docenteNombre;
    }

    public void setDocenteNombre(String docenteNombre) {
        this.docenteNombre = docenteNombre;
    }

    public String getDocenteCorreo() {
        return docenteCorreo;
    }

    public void setDocenteCorreo(String docenteCorreo) {
        this.docenteCorreo = docenteCorreo;
    }
}
