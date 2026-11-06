package com.universidad.servicio_curso.service;

import com.universidad.servicio_curso.dto.*;
import com.universidad.servicio_curso.model.AlertaCupo;
import com.universidad.servicio_curso.model.Curso;
import com.universidad.servicio_curso.model.EstadoCurso;
import com.universidad.servicio_curso.repository.CursoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CursoService {

    private final CursoRepository cursoRepository;

    public CursoService(CursoRepository cursoRepository) {
        this.cursoRepository = cursoRepository;
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listarTodos() {
        return cursoRepository.findAllActivosConPrerrequisitos()
                .stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CursoResponse obtenerPorId(Long id) {
        Curso curso = cursoRepository.findByIdConPrerrequisitos(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado con id " + id));
        return convertirAResponse(curso);
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listarPorCiclo(Integer ciclo) {
        if (ciclo < 1 || ciclo > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ciclo debe estar entre 1 y 10");
        }
        return cursoRepository.findByCicloAndActivoTrue(ciclo)
                .stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CursoResponse> listarPorDocente(Long docenteId) {
        return cursoRepository.findByDocenteIdAndActivoTrue(docenteId)
                .stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CursoResponse crear(CursoRequest request) {
        if (cursoRepository.existsByCodigo(request.getCodigo().trim().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un curso con el código " + request.getCodigo());
        }

        Curso curso = new Curso();
        mapearDatos(curso, request);
        curso.setCuposDisponibles(request.getCuposTotales());
        curso.setEstado(request.getCuposTotales() > 0 ? EstadoCurso.ACTIVO : EstadoCurso.CUPOS_AGOTADOS);
        curso.setActivo(true);

        asignarPrerrequisitos(curso, request.getPrerrequisitosIds());

        Curso guardado = cursoRepository.save(curso);
        return convertirAResponse(guardado);
    }

    @Transactional
    public CursoResponse actualizar(Long id, CursoRequest request) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado con id " + id));

        String nuevoCodigo = request.getCodigo().trim().toUpperCase();
        if (!curso.getCodigo().equalsIgnoreCase(nuevoCodigo) && cursoRepository.existsByCodigo(nuevoCodigo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El código " + nuevoCodigo + " ya está en uso");
        }

        mapearDatos(curso, request);
        asignarPrerrequisitos(curso, request.getPrerrequisitosIds());

        Curso actualizado = cursoRepository.save(curso);
        return convertirAResponse(actualizado);
    }

    @Transactional
    public AsignarDocenteRequest asignarDocente(Long id, AsignarDocenteRequest request) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado con id " + id));

        curso.setDocenteId(request.getDocenteId());
        curso.setDocenteNombre(request.getDocenteNombre().trim());
        curso.setDocenteCorreo(request.getDocenteCorreo() != null ? request.getDocenteCorreo().trim() : null);

        cursoRepository.save(curso);
        return request;
    }

    @Transactional
    public AvisoCancelacionResponse cancelarCursoConMotivo(Long id, CancelacionCursoRequest request) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado con id " + id));

        if (curso.getEstado() == EstadoCurso.CANCELADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El curso ya se encuentra cancelado");
        }

        curso.setActivo(false);
        curso.setEstado(EstadoCurso.CANCELADO);
        curso.setMotivoCancelacion(request.getMotivo().trim());
        curso.setCanceladoPor(request.getCanceladoPor().trim());
        curso.setFechaCancelacion(LocalDateTime.now());
        curso.setCuposDisponibles(0);

        cursoRepository.save(curso);

        AvisoCancelacionResponse aviso = new AvisoCancelacionResponse();
        aviso.setCursoId(curso.getId());
        aviso.setCodigo(curso.getCodigo());
        aviso.setNombre(curso.getNombre());
        aviso.setMotivo(curso.getMotivoCancelacion());
        aviso.setCanceladoPor(curso.getCanceladoPor());
        aviso.setFechaCancelacion(curso.getFechaCancelacion());
        aviso.setMensajeParaEstudiantes(String.format(
                "COMUNICADO ACADÉMICO: El curso %s (%s) ha sido cancelado por la coordinación académica. " +
                "Motivo: \"%s\". Las matrículas registradas en este curso serán desestimadas sin costo ni penalidad académica.",
                curso.getNombre(), curso.getCodigo(), curso.getMotivoCancelacion()
        ));

        return aviso;
    }

    @Transactional(readOnly = true)
    public List<CursoDisponibleResponse> evaluarDisponibilidadParaEstudiante(ConsultaDisponibilidadRequest request) {
        List<Curso> todosLosCursos = cursoRepository.findAllActivosConPrerrequisitos();
        Set<Long> aprobados = new HashSet<>(request.getCursosAprobadosIds() != null ? request.getCursosAprobadosIds() : Collections.emptyList());
        int cicloEstudiante = request.getCicloEstudiante() != null ? request.getCicloEstudiante() : 1;

        List<CursoDisponibleResponse> resultado = new ArrayList<>();

        for (Curso curso : todosLosCursos) {
            if (aprobados.contains(curso.getId())) {
                continue; // Ya aprobado
            }

            CursoDisponibleResponse disponible = new CursoDisponibleResponse();
            disponible.setCurso(convertirAResponse(curso));
            disponible.setEsAdelanto(curso.getCiclo() > cicloEstudiante);
            disponible.setTieneCupo(curso.tieneCupos());

            // Validación de prerrequisitos pendientes
            List<String> faltantes = new ArrayList<>();
            for (Curso pre : curso.getPrerrequisitos()) {
                if (!aprobados.contains(pre.getId())) {
                    faltantes.add(pre.getCodigo() + " - " + pre.getNombre() + " (Ciclo " + pre.getCiclo() + ")");
                }
            }
            disponible.setPrerrequisitosFaltantes(faltantes);

            if (!faltantes.isEmpty()) {
                disponible.setHabilitado(false);
                disponible.setObservacion("Bloqueado: debes aprobar los prerrequisitos pendientes antes de matricularte.");
            } else if (!curso.tieneCupos()) {
                disponible.setHabilitado(false);
                disponible.setObservacion("Cumples con los prerrequisitos, pero las vacantes están agotadas.");
            } else {
                disponible.setHabilitado(true);
                disponible.setObservacion(disponible.isEsAdelanto() 
                        ? "Habilitado para ADELANTO de ciclo superior (¡Prerrequisitos aprobados y vacantes disponibles!)" 
                        : "Habilitado para matrícula de tu ciclo regular.");
            }

            resultado.add(disponible);
        }

        return resultado;
    }

    @Transactional
    public CursoResponse reservarCupo(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado con id " + id));

        if (!curso.getActivo() || curso.getEstado() == EstadoCurso.CANCELADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El curso no está activo o ha sido cancelado");
        }

        if (curso.getCuposDisponibles() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No hay vacantes disponibles para el curso " + curso.getNombre());
        }

        curso.setCuposDisponibles(curso.getCuposDisponibles() - 1);
        Curso guardado = cursoRepository.save(curso);
        return convertirAResponse(guardado);
    }

    @Transactional
    public CursoResponse liberarCupo(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado con id " + id));

        if (curso.getCuposDisponibles() < curso.getCuposTotales()) {
            curso.setCuposDisponibles(curso.getCuposDisponibles() + 1);
        }

        Curso guardado = cursoRepository.save(curso);
        return convertirAResponse(guardado);
    }

    private void mapearDatos(Curso curso, CursoRequest request) {
        curso.setCodigo(request.getCodigo().trim().toUpperCase());
        curso.setNombre(request.getNombre().trim());
        curso.setCreditos(request.getCreditos());
        curso.setCiclo(request.getCiclo());
        curso.setCuposTotales(request.getCuposTotales());
        if (curso.getCuposDisponibles() == null || curso.getCuposDisponibles() > request.getCuposTotales()) {
            curso.setCuposDisponibles(request.getCuposTotales());
        }
    }

    private void asignarPrerrequisitos(Curso curso, Set<Long> prerrequisitosIds) {
        Set<Curso> prerrequisitos = new HashSet<>();
        if (prerrequisitosIds != null && !prerrequisitosIds.isEmpty()) {
            for (Long preId : prerrequisitosIds) {
                if (curso.getId() != null && curso.getId().equals(preId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                            "ERROR DE CONSISTENCIA: Un curso no puede ser prerrequisito de sí mismo (evita bucles circulares).");
                }
                Curso pre = cursoRepository.findById(preId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prerrequisito no encontrado con id " + preId));

                // REGLA ACADÉMICA ESTRICTA: El prerrequisito DEBE ser de un ciclo menor.
                // Esta regla matemática garantiza que NUNCA pueda existir un bucle circular (Grafo Acíclico Dirigido).
                if (pre.getCiclo() >= curso.getCiclo()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                            String.format("BUCLE O ERROR DE NIVEL: El prerrequisito '%s' (Ciclo %d) debe pertenecer a un ciclo estrictamente menor que el curso actual (Ciclo %d).",
                                    pre.getCodigo(), pre.getCiclo(), curso.getCiclo()));
                }

                // Detección profunda de dependencias circulares inversas
                if (curso.getId() != null && tieneDependenciaRecursiva(pre, curso.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                            "BUCLE CIRCULAR DETECTADO: El curso seleccionado ya depende indirectamente de este curso.");
                }

                prerrequisitos.add(pre);
            }
        }
        curso.setPrerrequisitos(prerrequisitos);
    }

    private boolean tieneDependenciaRecursiva(Curso cursoAEvaluar, Long cursoObjetivoId) {
        if (cursoAEvaluar.getPrerrequisitos() == null || cursoAEvaluar.getPrerrequisitos().isEmpty()) {
            return false;
        }
        for (Curso p : cursoAEvaluar.getPrerrequisitos()) {
            if (Objects.equals(p.getId(), cursoObjetivoId)) {
                return true;
            }
            if (tieneDependenciaRecursiva(p, cursoObjetivoId)) {
                return true;
            }
        }
        return false;
    }

    private CursoResponse convertirAResponse(Curso curso) {
        CursoResponse res = new CursoResponse();
        res.setId(curso.getId());
        res.setCodigo(curso.getCodigo());
        res.setNombre(curso.getNombre());
        res.setCreditos(curso.getCreditos());
        res.setCiclo(curso.getCiclo());
        res.setCuposTotales(curso.getCuposTotales());
        res.setCuposDisponibles(curso.getCuposDisponibles());
        res.setActivo(curso.getActivo());
        res.setEstado(curso.getEstado() != null ? curso.getEstado().name() : "ACTIVO");

        // Datos del Docente
        res.setDocenteId(curso.getDocenteId());
        res.setDocenteNombre(curso.getDocenteNombre() != null ? curso.getDocenteNombre() : "Por asignar");
        res.setDocenteCorreo(curso.getDocenteCorreo());

        // Datos de Cancelación
        res.setMotivoCancelacion(curso.getMotivoCancelacion());
        res.setFechaCancelacion(curso.getFechaCancelacion());

        // Alertas inteligentes de Cupos para el estudiante y administración
        AlertaCupo alerta = curso.obtenerAlertaCupo();
        res.setAlertaCupo(alerta.name());
        if (alerta == AlertaCupo.AGOTADO) {
            res.setMensajeCupo("🚫 Vacantes agotadas para este periodo");
        } else if (alerta == AlertaCupo.ULTIMOS_CUPOS) {
            res.setMensajeCupo("⚠️ ¡Atención! Solo quedan " + curso.getCuposDisponibles() + " vacante(s) disponible(s)");
        } else {
            res.setMensajeCupo("✅ Vacantes disponibles (" + curso.getCuposDisponibles() + " libres)");
        }

        // Porcentaje de ocupación
        if (curso.getCuposTotales() > 0) {
            int ocupados = curso.getCuposTotales() - curso.getCuposDisponibles();
            double pct = ((double) ocupados / curso.getCuposTotales()) * 100.0;
            res.setPorcentajeOcupacion(Math.round(pct * 10.0) / 10.0);
        } else {
            res.setPorcentajeOcupacion(0.0);
        }

        // Prerrequisitos ordenados
        if (curso.getPrerrequisitos() != null) {
            List<PrerrequisitoDTO> preDTOs = curso.getPrerrequisitos()
                    .stream()
                    .map(p -> new PrerrequisitoDTO(p.getId(), p.getCodigo(), p.getNombre(), p.getCiclo()))
                    .sorted(Comparator.comparing(PrerrequisitoDTO::getCiclo).thenComparing(PrerrequisitoDTO::getCodigo))
                    .collect(Collectors.toList());
            res.setPrerrequisitos(preDTOs);
        }
        return res;
    }
}
