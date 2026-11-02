package com.universidad.servicio_matricula.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matricula",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"estudiante_id", "curso_id", "periodo"})
    }
)
public class Matricula {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "estudiante_id", nullable = false)
    private Long estudianteId;

    @Column(name = "curso_id", nullable = false)
    private Long cursoId;

    @Column(name = "periodo", nullable = false)
    private String periodo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoMatricula estado;

    @Column(name = "fecha_matricula", nullable = false)
    private LocalDateTime fechaMatricula;

    @PrePersist
    public void antesDeGuardar() {
        this.fechaMatricula = LocalDateTime.now();
        this.estado = EstadoMatricula.ACTIVA; // Establecer el estado inicial como ACTIVA
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEstudianteId() {
        return estudianteId;
    }

    public void setEstudianteId(Long estudianteId) {
        this.estudianteId = estudianteId;
    }

    public Long getCursoId() {
        return cursoId;
    }

    public void setCursoId(Long cursoId) {
        this.cursoId = cursoId;
    }

    public String getPeriodo() {
        return periodo;
    }

    public void setPeriodo(String periodo) {
        this.periodo = periodo;
    }

    public EstadoMatricula getEstado() {
        return estado;
    }

    public void setEstado(EstadoMatricula estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaMatricula() {
        return fechaMatricula;
    }

    public void setFechaMatricula(LocalDateTime fechaMatricula) {
        this.fechaMatricula = fechaMatricula;
    }

    

}
