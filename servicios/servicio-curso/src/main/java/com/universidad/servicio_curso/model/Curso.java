package com.universidad.servicio_curso.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "cursos")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El código del curso es obligatorio")
    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String codigo;

    @NotBlank(message = "El nombre del curso es obligatorio")
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @NotNull(message = "Los créditos son obligatorios")
    @Min(value = 1, message = "El curso debe tener al menos 1 crédito")
    @Column(name = "creditos", nullable = false)
    private Integer creditos;

    @NotNull(message = "El ciclo es obligatorio")
    @Min(value = 1, message = "El ciclo mínimo es 1")
    @Max(value = 10, message = "El ciclo máximo es 10")
    @Column(name = "ciclo", nullable = false)
    private Integer ciclo;

    @NotNull(message = "Los cupos totales son obligatorios")
    @Min(value = 0, message = "Los cupos no pueden ser negativos")
    @Column(name = "cupos_totales", nullable = false)
    private Integer cuposTotales;

    @NotNull(message = "Los cupos disponibles son obligatorios")
    @Min(value = 0, message = "Los cupos disponibles no pueden ser negativos")
    @Column(name = "cupos_disponibles", nullable = false)
    private Integer cuposDisponibles;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoCurso estado = EstadoCurso.ACTIVO;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    // Información del Docente asignado
    @Column(name = "docente_id")
    private Long docenteId;

    @Column(name = "docente_nombre", length = 150)
    private String docenteNombre;

    @Column(name = "docente_correo", length = 150)
    private String docenteCorreo;

    // Auditoría de cancelación justificada
    @Column(name = "motivo_cancelacion", length = 500)
    private String motivoCancelacion;

    @Column(name = "cancelado_por", length = 100)
    private String canceladoPor;

    @Column(name = "fecha_cancelacion")
    private LocalDateTime fechaCancelacion;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "curso_prerrequisitos",
        joinColumns = @JoinColumn(name = "curso_id"),
        inverseJoinColumns = @JoinColumn(name = "prerrequisito_id")
    )
    private Set<Curso> prerrequisitos = new HashSet<>();

    public Curso() {
    }

    public Curso(String codigo, String nombre, Integer creditos, Integer ciclo, Integer cuposTotales) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.creditos = creditos;
        this.ciclo = ciclo;
        this.cuposTotales = cuposTotales;
        this.cuposDisponibles = cuposTotales;
        this.estado = EstadoCurso.ACTIVO;
        this.activo = true;
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
        if (this.estado != EstadoCurso.CANCELADO && this.estado != EstadoCurso.CERRADO) {
            if (this.cuposDisponibles <= 0) {
                this.estado = EstadoCurso.CUPOS_AGOTADOS;
            } else {
                this.estado = EstadoCurso.ACTIVO;
            }
        }
    }

    public EstadoCurso getEstado() {
        return estado;
    }

    public void setEstado(EstadoCurso estado) {
        this.estado = estado;
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

    public Set<Curso> getPrerrequisitos() {
        return prerrequisitos;
    }

    public void setPrerrequisitos(Set<Curso> prerrequisitos) {
        this.prerrequisitos = prerrequisitos;
    }

    public boolean tieneCupos() {
        return this.cuposDisponibles != null && this.cuposDisponibles > 0 && this.estado != EstadoCurso.CANCELADO;
    }

    public AlertaCupo obtenerAlertaCupo() {
        if (this.cuposDisponibles == null || this.cuposDisponibles <= 0) {
            return AlertaCupo.AGOTADO;
        }
        if (this.cuposDisponibles <= 5) {
            return AlertaCupo.ULTIMOS_CUPOS;
        }
        return AlertaCupo.DISPONIBLE;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Curso curso = (Curso) o;
        return Objects.equals(id, curso.id) || Objects.equals(codigo, curso.codigo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, codigo);
    }
}
