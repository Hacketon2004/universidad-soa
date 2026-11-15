package com.universidad.servicio_matricula.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.universidad.servicio_matricula.cliente.CursoClient;
import com.universidad.servicio_matricula.cliente.EstudianteClient;
import com.universidad.servicio_matricula.model.EstadoMatricula;
import com.universidad.servicio_matricula.model.Matricula;
import com.universidad.servicio_matricula.repository.MatriculaRepository;

@Service
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final EstudianteClient estudianteClient;
    private final CursoClient cursoClient;

    public MatriculaService(MatriculaRepository matriculaRepository,
                            EstudianteClient estudianteClient,
                            CursoClient cursoClient) {
        this.matriculaRepository = matriculaRepository;
        this.estudianteClient = estudianteClient;
        this.cursoClient = cursoClient;
    }

    // 1. REGISTRAR
    public Matricula registrar(Long estudianteId, Long cursoId, String periodo, String authorization) {
        Optional<Matricula> existente =
                matriculaRepository.findByEstudianteIdAndCursoIdAndPeriodo(estudianteId, cursoId, periodo);

        // a) Regla local: no matricular dos veces (no hace falta preguntar a nadie)
        if (existente.isPresent() && existente.get().getEstado() == EstadoMatricula.ACTIVA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El estudiante ya está matriculado en este curso para el periodo " + periodo);
        }

        // b) Servicio de estudiantes: ¿existe y está activo?
        estudianteClient.verificarEstudianteActivo(estudianteId, authorization);

        // c) Servicio de cursos: ¿existe, está activo y tiene cupo? (descuenta 1)
        cursoClient.reservarCupo(cursoId, authorization);

        // d) Guardar. Si falla, se devuelve el cupo reservado (compensación)
        try {
            if (existente.isPresent()) {
                // Estaba ANULADA: se reactiva en vez de crear otra fila
                Matricula matricula = existente.get();
                matricula.setEstado(EstadoMatricula.ACTIVA);
                matricula.setFechaMatricula(LocalDateTime.now());
                return matriculaRepository.save(matricula);
            }

            Matricula nueva = new Matricula();
            nueva.setEstudianteId(estudianteId);
            nueva.setCursoId(cursoId);
            nueva.setPeriodo(periodo);
            return matriculaRepository.save(nueva);

        } catch (RuntimeException ex) {
            cursoClient.liberarCupoSinFallar(cursoId, authorization);
            throw ex;
        }
    }

    // 2. LISTAR
    public List<Matricula> listarPorEstudiante(Long estudianteId) {
        return matriculaRepository.findByEstudianteId(estudianteId);
    }

    // 3. ANULAR
    public Matricula anular(Long id, String authorization) {
        Matricula matricula = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe la matrícula con id " + id));

        if (matricula.getEstado() == EstadoMatricula.ANULADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La matrícula ya está anulada");
        }

        // Primero se devuelve el cupo; si cursos no responde, la matrícula NO se anula
        cursoClient.liberarCupo(matricula.getCursoId(), authorization);

        matricula.setEstado(EstadoMatricula.ANULADA);
        return matriculaRepository.save(matricula);
    }
}
