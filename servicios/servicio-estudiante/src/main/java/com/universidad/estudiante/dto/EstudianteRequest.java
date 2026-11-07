
package com.universidad.estudiante.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public class EstudianteRequest {

    @NotBlank(message = "El ID del usuario es obligatorio")
    private String usuarioId;

    @NotBlank(message = "El código del estudiante es obligatorio")
    private String codigoEstudiante;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "\\d{8}", message = "El DNI debe tener 8 dígitos")
    private String dni;

    @NotBlank(message = "Los nombres son obligatorios")
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    private String telefono;
    private LocalDate fechaNacimiento;
    private String direccion;

    @NotBlank(message = "La carrera es obligatoria")
    private String carrera;

    private Integer cicloActual;

    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }

    public String getCodigoEstudiante() { return codigoEstudiante; }
    public void setCodigoEstudiante(String codigoEstudiante) { this.codigoEstudiante = codigoEstudiante; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCarrera() { return carrera; }
    public void setCarrera(String carrera) { this.carrera = carrera; }

    public Integer getCicloActual() { return cicloActual; }
    public void setCicloActual(Integer cicloActual) { this.cicloActual = cicloActual; }
}
