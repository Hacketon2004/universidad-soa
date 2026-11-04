package com.universidad.servicio_matricula.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.servicio_matricula.dto.MatriculaRequest;
import com.universidad.servicio_matricula.model.Matricula;
import com.universidad.servicio_matricula.service.MatriculaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    private final MatriculaService matriculaService;

    public MatriculaController(MatriculaService matriculaService) {
        this.matriculaService = matriculaService;
    }

    // POST /matriculas → registrar
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Matricula registrar(@Valid @RequestBody MatriculaRequest request) {
        return matriculaService.registrar(
                request.estudianteId(),
                request.cursoId(),
                request.periodo()
        );
    }

    // GET /matriculas/estudiante/{estudianteId} → listar
    @GetMapping("/estudiante/{estudianteId}")
    public List<Matricula> listarPorEstudiante(@PathVariable Long estudianteId) {
        return matriculaService.listarPorEstudiante(estudianteId);
    }

    // PUT /matriculas/{id}/anular → anular
    @PutMapping("/{id}/anular")
    public Matricula anular(@PathVariable Long id) {
        return matriculaService.anular(id);
    }
}