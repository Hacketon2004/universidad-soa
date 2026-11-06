package com.universidad.servicio_curso.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CursoResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private Integer creditos;
    private Integer ciclo;
    private Integer cuposTotales;
    private Integer cuposDisponibles;
    private String estado;
    private String alertaCupo;
    private String mensajeCupo;
    private Double porcentajeOcupacion;
    private Boolean activo;

    // Docente
    private Long docenteId;
    private String docenteNombre;
    private String docenteCorreo;

    // Cancelación
    private String motivoCancelacion;
    private LocalDateTime fechaCancelacion;

    private List<PrerrequisitoDTO> prerrequisitos = new ArrayList<>();

    public CursoResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getCreditos() {
        return creditos;
    }

    public void setCreditos(Integer creditos) {
        this.creditos = creditos;
    }

    public Integer getCiclo() {
        return ciclo;
    }

    public void setCiclo(Integer ciclo) {
        this.ciclo = ciclo;
    }

    public Integer getCuposTotales() {
        return cuposTotales;
    }

    public void setCuposTotales(Integer cuposTotales) {
        this.cuposTotales = cuposTotales;
    }

    public Integer getCuposDisponibles() {
        return cuposDisponibles;
    }

    public void setCuposDisponibles(Integer cuposDisponibles) {
        this.cuposDisponibles = cuposDisponibles;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getAlertaCupo() {
        return alertaCupo;
    }

    public void setAlertaCupo(String alertaCupo) {
        this.alertaCupo = alertaCupo;
    }

    public String getMensajeCupo() {
        return mensajeCupo;
    }

    public void setMensajeCupo(String mensajeCupo) {
        this.mensajeCupo = mensajeCupo;
    }

    public Double getPorcentajeOcupacion() {
        return porcentajeOcupacion;
    }

    public void setPorcentajeOcupacion(Double porcentajeOcupacion) {
        this.porcentajeOcupacion = porcentajeOcupacion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
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

    public String getMotivoCancelacion() {
        return motivoCancelacion;
    }

    public void setMotivoCancelacion(String motivoCancelacion) {
        this.motivoCancelacion = motivoCancelacion;
    }

    public LocalDateTime getFechaCancelacion() {
        return fechaCancelacion;
    }

    public void setFechaCancelacion(LocalDateTime fechaCancelacion) {
        this.fechaCancelacion = fechaCancelacion;
    }

    public List<PrerrequisitoDTO> getPrerrequisitos() {
        return prerrequisitos;
    }

    public void setPrerrequisitos(List<PrerrequisitoDTO> prerrequisitos) {
        this.prerrequisitos = prerrequisitos;
    }
}
