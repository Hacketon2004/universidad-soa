package com.universidad.servicio_curso.dto;

public class PrerrequisitoDTO {
    private Long id;
    private String codigo;
    private String nombre;
    private Integer ciclo;

    public PrerrequisitoDTO() {
    }

    public PrerrequisitoDTO(Long id, String codigo, String nombre, Integer ciclo) {
        this.id = id;
        this.codigo = codigo;
        this.nombre = nombre;
        this.ciclo = ciclo;
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

    public Integer getCiclo() {
        return ciclo;
    }

    public void setCiclo(Integer ciclo) {
        this.ciclo = ciclo;
    }
}
