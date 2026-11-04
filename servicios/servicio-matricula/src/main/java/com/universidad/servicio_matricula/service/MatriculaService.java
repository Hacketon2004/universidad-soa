package com.universidad.servicio_matricula.service;

import com.universidad.servicio_matricula.model.EstadoMatricula;
import com.universidad.servicio_matricula.model.Matricula;
import com.universidad.servicio_matricula.repository.MatriculaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;

    public MatriculaService(MatriculaRepository matriculaRepository) {
        this.matriculaRepository = matriculaRepository;
    }

    // 1. REGISTRAR
    public Matricula registrar(Long estudianteId, Long cursoId, String periodo) {
        Optional<Matricula> existente =
                matriculaRepository.findByEstudianteIdAndCursoIdAndPeriodo(estudianteId, cursoId, periodo);

        if (existente.isPresent()) {
            Matricula matricula = existente.get();

            if (matricula.getEstado() == EstadoMatricula.ACTIVA) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El estudiante ya está matriculado en este curso para el periodo " + periodo);
            }

            // Estaba ANULADA: se reactiva en vez de crear otra fila
            matricula.setEstado(EstadoMatricula.ACTIVA);
            matricula.setFechaMatricula(LocalDateTime.now());
            return matriculaRepository.save(matricula);
        }

        Matricula nueva = new Matricula();
        nueva.setEstudianteId(estudianteId);
        nueva.setCursoId(cursoId);
        nueva.setPeriodo(periodo);
        return matriculaRepository.save(nueva);
    }

    // 2. LISTAR
    public List<Matricula> listarPorEstudiante(Long estudianteId) {
        return matriculaRepository.findByEstudianteId(estudianteId);
    }

    // 3. ANULAR
    public Matricula anular(Long id) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe la matrícula con id " + id));

        if (matricula.getEstado() == EstadoMatricula.ANULADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La matrícula ya está anulada");
        }

        matricula.setEstado(EstadoMatricula.ANULADA);
        return matriculaRepository.save(matricula);
    }
}