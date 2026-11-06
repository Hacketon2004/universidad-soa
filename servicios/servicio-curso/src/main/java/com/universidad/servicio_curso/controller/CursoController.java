package com.universidad.servicio_curso.controller;

import com.universidad.servicio_curso.dto.*;
import com.universidad.servicio_curso.service.CursoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    // 1. LISTAR TODOS LOS CURSOS ACTIVOS
    @GetMapping
    public ResponseEntity<List<CursoResponse>> listarTodos() {
        return ResponseEntity.ok(cursoService.listarTodos());
    }

    // 2. OBTENER CURSO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<CursoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.obtenerPorId(id));
    }

    // 3. LISTAR CURSOS POR CICLO ACADÉMICO (1 AL 10)
    @GetMapping("/ciclo/{ciclo}")
    public ResponseEntity<List<CursoResponse>> listarPorCiclo(@PathVariable Integer ciclo) {
        return ResponseEntity.ok(cursoService.listarPorCiclo(ciclo));
    }

    // 4. LISTAR CURSOS ASIGNADOS A UN DOCENTE
    @GetMapping("/docente/{docenteId}")
    public ResponseEntity<List<CursoResponse>> listarPorDocente(@PathVariable Long docenteId) {
        return ResponseEntity.ok(cursoService.listarPorDocente(docenteId));
    }

    // 5. EVALUACIÓN INTELIGENTE DE CURSOS Y ADELANTO PARA UN ESTUDIANTE
    @PostMapping("/disponibles")
    public ResponseEntity<List<CursoDisponibleResponse>> evaluarDisponibles(
            @RequestBody ConsultaDisponibilidadRequest request) {
        return ResponseEntity.ok(cursoService.evaluarDisponibilidadParaEstudiante(request));
    }

    // 6. CREAR CURSO (ADMIN)
    @PostMapping
    public ResponseEntity<CursoResponse> crear(@Valid @RequestBody CursoRequest request) {
        CursoResponse nuevo = cursoService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    // 7. ACTUALIZAR CURSO (ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<CursoResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CursoRequest request) {
        return ResponseEntity.ok(cursoService.actualizar(id, request));
    }

    // 8. ASIGNAR O CAMBIAR DOCENTE A CARGO DEL CURSO (ADMIN)
    @PutMapping("/{id}/docente")
    public ResponseEntity<AsignarDocenteRequest> asignarDocente(
            @PathVariable Long id,
            @Valid @RequestBody AsignarDocenteRequest request) {
        return ResponseEntity.ok(cursoService.asignarDocente(id, request));
    }

    // 9. CANCELAR CURSO CON JUSTIFICACIÓN Y MENSAJE DE AVISO (ADMIN)
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<AvisoCancelacionResponse> cancelarCurso(
            @PathVariable Long id,
            @Valid @RequestBody CancelacionCursoRequest request) {
        return ResponseEntity.ok(cursoService.cancelarCursoConMotivo(id, request));
    }

    // 10. ELIMINAR / DESACTIVAR CURSO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cursoService.cancelarCursoConMotivo(id, new CancelacionCursoRequest("Baja administrativa del curso", "ADMINISTRADOR"));
        return ResponseEntity.noContent().build();
    }

    // 11. RESERVAR CUPO (INTEGRACIÓN MATRÍCULA)
    @PutMapping("/{id}/reservar-cupo")
    public ResponseEntity<CursoResponse> reservarCupo(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.reservarCupo(id));
    }

    // 12. LIBERAR CUPO (INTEGRACIÓN MATRÍCULA)
    @PutMapping("/{id}/liberar-cupo")
    public ResponseEntity<CursoResponse> liberarCupo(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.liberarCupo(id));
    }
}
