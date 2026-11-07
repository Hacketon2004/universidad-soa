
package com.universidad.estudiante.service;
import com.universidad.estudiante.dto.EstudianteRequest;
import com.universidad.estudiante.dto.EstudianteResponse;
import com.universidad.estudiante.exception.EstudianteNoEncontradoException;
import com.universidad.estudiante.model.Estudiante;
import com.universidad.estudiante.repository.EstudianteRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;

    public EstudianteService(EstudianteRepository estudianteRepository) {
        this.estudianteRepository = estudianteRepository;
    }

    // REGISTRAR ESTUDIANTE
    @Transactional
    public EstudianteResponse registrar(EstudianteRequest request) {

        if (estudianteRepository.existsByDni(request.getDni())) {
            throw new IllegalStateException("El DNI ya está registrado");
        }

        if (estudianteRepository.existsByCodigoEstudiante(request.getCodigoEstudiante())) {
            throw new IllegalStateException("El código de estudiante ya está registrado");
        }

        Estudiante estudiante = new Estudiante();
        estudiante.setUsuarioId(request.getUsuarioId());
        estudiante.setCodigoEstudiante(request.getCodigoEstudiante());
        estudiante.setDni(request.getDni());
        estudiante.setNombres(request.getNombres());
        estudiante.setApellidos(request.getApellidos());
        estudiante.setTelefono(request.getTelefono());
        estudiante.setFechaNacimiento(request.getFechaNacimiento());
        estudiante.setDireccion(request.getDireccion());
        estudiante.setCarrera(request.getCarrera());
        estudiante.setCicloActual(request.getCicloActual());
        estudiante.setEstado("ACTIVO");

        return convertirAResponse(estudianteRepository.save(estudiante));
    }

    // LISTAR TODOS LOS ESTUDIANTES
    @Transactional(readOnly = true)
    public List<EstudianteResponse> listar() {
        return estudianteRepository.findAll()
                .stream()
                .map(this::convertirAResponse)
                .toList();
    }

    // BUSCAR ESTUDIANTE POR ID
    @Transactional(readOnly = true)
    public EstudianteResponse buscarPorId(Long id) {
        Estudiante estudiante = obtenerEstudiante(id);
        return convertirAResponse(estudiante);
    }

    // ACTUALIZAR ESTUDIANTE
    @Transactional
    public EstudianteResponse actualizar(Long id, EstudianteRequest request) {

        Estudiante estudiante = obtenerEstudiante(id);

        estudianteRepository.findByDni(request.getDni())
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(existente -> {
                    throw new IllegalStateException("El DNI ya pertenece a otro estudiante");
                });

        estudianteRepository.findByCodigoEstudiante(request.getCodigoEstudiante())
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(existente -> {
                    throw new IllegalStateException("El código ya pertenece a otro estudiante");
                });

        estudiante.setUsuarioId(request.getUsuarioId());
        estudiante.setCodigoEstudiante(request.getCodigoEstudiante());
        estudiante.setDni(request.getDni());
        estudiante.setNombres(request.getNombres());
        estudiante.setApellidos(request.getApellidos());
        estudiante.setTelefono(request.getTelefono());
        estudiante.setFechaNacimiento(request.getFechaNacimiento());
        estudiante.setDireccion(request.getDireccion());
        estudiante.setCarrera(request.getCarrera());
        estudiante.setCicloActual(request.getCicloActual());

        return convertirAResponse(estudianteRepository.save(estudiante));
    }

    // ELIMINAR ESTUDIANTE
    @Transactional
    public void eliminar(Long id) {
        Estudiante estudiante = obtenerEstudiante(id);
        estudianteRepository.delete(estudiante);
    }

    // CAMBIAR ESTADO DEL ESTUDIANTE
    @Transactional
    public EstudianteResponse cambiarEstado(Long id, String estado) {

        if (estado == null || !List.of("ACTIVO", "INACTIVO").contains(estado.toUpperCase())) {
            throw new IllegalArgumentException("El estado debe ser ACTIVO o INACTIVO");
        }

        Estudiante estudiante = obtenerEstudiante(id);
        estudiante.setEstado(estado.toUpperCase());

        return convertirAResponse(estudianteRepository.save(estudiante));
    }

    // BUSCAR ESTUDIANTE EN BASE DE DATOS
   private Estudiante obtenerEstudiante(Long id) {
    return estudianteRepository.findById(id)
            .orElseThrow(() -> new EstudianteNoEncontradoException(
                    "No existe el estudiante con id " + id));
}

    // CONVERTIR MODELO A DTO DE RESPUESTA
    private EstudianteResponse convertirAResponse(Estudiante estudiante) {
        return new EstudianteResponse(
                estudiante.getId(),
                estudiante.getUsuarioId(),
                estudiante.getCodigoEstudiante(),
                estudiante.getDni(),
                estudiante.getNombres(),
                estudiante.getApellidos(),
                estudiante.getTelefono(),
                estudiante.getFechaNacimiento(),
                estudiante.getDireccion(),
                estudiante.getCarrera(),
                estudiante.getCicloActual(),
                "ACTIVO".equalsIgnoreCase(estudiante.getEstado())
        );
    }
}
