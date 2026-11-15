
package com.universidad.estudiante.dto;

import java.time.LocalDate;

public class EstudianteResponse {

    private Long id;
    private String usuarioId;
    private String codigo;
    private String dni;
    private String nombres;
    private String apellidos;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String direccion;
    private String carrera;
    private Integer cicloActual;
    private boolean activo;

    public EstudianteResponse() {
    }

    public EstudianteResponse(
            Long id,
            String usuarioId,
            String codigo,
            String dni,
            String nombres,
            String apellidos,
            String telefono,
            LocalDate fechaNacimiento,
            String direccion,
            String carrera,
            Integer cicloActual,
            boolean activo) {

        this.id = id;
        this.usuarioId = usuarioId;
        this.codigo = codigo;
        this.dni = dni;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.direccion = direccion;
        this.carrera = carrera;
        this.cicloActual = cicloActual;
        this.activo = activo;
    }

    public Long getId() { return id; }
    public String getUsuarioId() { return usuarioId; }
    public String getCodigo() { return codigo; }
    public String getDni() { return dni; }
    public String getNombres() { return nombres; }
    public String getApellidos() { return apellidos; }
    public String getTelefono() { return telefono; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public String getDireccion() { return direccion; }
    public String getCarrera() { return carrera; }
    public Integer getCicloActual() { return cicloActual; }
    public boolean isActivo() { return activo; }
}
