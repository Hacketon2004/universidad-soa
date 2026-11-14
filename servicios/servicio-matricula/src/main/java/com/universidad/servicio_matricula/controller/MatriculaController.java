package com.universidad.servicio_matricula.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
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

    // POST /api/matriculas → registrar
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Matricula registrar(
            @Valid @RequestBody MatriculaRequest request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        return matriculaService.registrar(
                request.estudianteId(),
                request.cursoId(),
                request.periodo(),
                authorization
        );
    }

    // GET /api/matriculas/estudiante/{estudianteId} → listar
    @GetMapping("/estudiante/{estudianteId}")
    public List<Matricula> listarPorEstudiante(@PathVariable Long estudianteId) {
        return matriculaService.listarPorEstudiante(estudianteId);
    }

    // PUT /api/matriculas/{id}/anular → anular
    @PutMapping("/{id}/anular")
    public Matricula anular(
            @PathVariable Long id,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        return matriculaService.anular(id, authorization);
    }
}
