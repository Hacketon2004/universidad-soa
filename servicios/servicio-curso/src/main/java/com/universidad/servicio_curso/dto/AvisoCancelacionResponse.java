package com.universidad.servicio_curso.dto;

import java.time.LocalDateTime;

public class AvisoCancelacionResponse {

    private Long cursoId;
    private String codigo;
    private String nombre;
    private String motivo;
    private String canceladoPor;
    private LocalDateTime fechaCancelacion;
    private String mensajeParaEstudiantes;

    public AvisoCancelacionResponse() {
    }

    public Long getCursoId() {
        return cursoId;
    }

    public void setCursoId(Long cursoId) {
        this.cursoId = cursoId;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
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

    public LocalDateTime getFechaCancelacion() {
        return fechaCancelacion;
    }

    public void setFechaCancelacion(LocalDateTime fechaCancelacion) {
        this.fechaCancelacion = fechaCancelacion;
    }

    public String getMensajeParaEstudiantes() {
        return mensajeParaEstudiantes;
    }

    public void setMensajeParaEstudiantes(String mensajeParaEstudiantes) {
        this.mensajeParaEstudiantes = mensajeParaEstudiantes;
    }
}
