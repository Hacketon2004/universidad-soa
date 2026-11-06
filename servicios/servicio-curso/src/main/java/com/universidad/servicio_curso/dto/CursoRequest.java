package com.universidad.servicio_curso.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.HashSet;
import java.util.Set;

public class CursoRequest {

    @NotBlank(message = "El código es obligatorio")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "Los créditos son obligatorios")
    @Min(value = 1, message = "Mínimo 1 crédito")
    private Integer creditos;

    @NotNull(message = "El ciclo es obligatorio")
    @Min(value = 1, message = "El ciclo mínimo es 1")
    @Max(value = 10, message = "El ciclo máximo es 10")
    private Integer ciclo;

    @NotNull(message = "Los cupos totales son obligatorios")
    @Min(value = 0, message = "Los cupos no pueden ser negativos")
    private Integer cuposTotales;

    private Set<Long> prerrequisitosIds = new HashSet<>();

    public CursoRequest() {
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

    public Set<Long> getPrerrequisitosIds() {
        return prerrequisitosIds;
    }

    public void setPrerrequisitosIds(Set<Long> prerrequisitosIds) {
        this.prerrequisitosIds = prerrequisitosIds;
    }
}
