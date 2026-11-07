
package com.universidad.estudiante.repository;

import com.universidad.estudiante.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    Optional<Estudiante> findByDni(String dni);

    Optional<Estudiante> findByCodigoEstudiante(String codigoEstudiante);

    boolean existsByDni(String dni);

    boolean existsByCodigoEstudiante(String codigoEstudiante);
}
