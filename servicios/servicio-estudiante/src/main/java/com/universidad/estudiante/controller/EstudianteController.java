
package com.universidad.estudiante.controller;

import com.universidad.estudiante.dto.EstudianteRequest;
import com.universidad.estudiante.dto.EstudianteResponse;
import com.universidad.estudiante.service.EstudianteService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteController {

    private final EstudianteService estudianteService;

    public EstudianteController(EstudianteService estudianteService) {
        this.estudianteService = estudianteService;
    }

    // REGISTRAR ESTUDIANTE
    @PostMapping
    public ResponseEntity<EstudianteResponse> registrar(
            @Valid @RequestBody EstudianteRequest request) {

        EstudianteResponse respuesta = estudianteService.registrar(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    // LISTAR ESTUDIANTES
    @GetMapping
    public ResponseEntity<List<EstudianteResponse>> listar() {

        return ResponseEntity.ok(estudianteService.listar());
    }

    // BUSCAR POR ID
    @GetMapping("/{id}")
    public ResponseEntity<EstudianteResponse> buscarPorId(@PathVariable Long id) {

        return ResponseEntity.ok(estudianteService.buscarPorId(id));
    }

    // ACTUALIZAR ESTUDIANTE
    @PutMapping("/{id}")
    public ResponseEntity<EstudianteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody EstudianteRequest request) {

        return ResponseEntity.ok(estudianteService.actualizar(id, request));
    }

    // ELIMINAR ESTUDIANTE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {

        estudianteService.eliminar(id);

        return ResponseEntity.noContent().build();
    }

    // CAMBIAR ESTADO
    @PatchMapping("/{id}/estado")
    public ResponseEntity<EstudianteResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {

        return ResponseEntity.ok(
                estudianteService.cambiarEstado(id, estado));
    }
}
