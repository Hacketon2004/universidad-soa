package com.universidad.servicio_matricula.repository;

import com.universidad.servicio_matricula.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    List<Matricula> findByEstudianteId(Long estudianteId);

    Optional<Matricula> findByEstudianteIdAndCursoIdAndPeriodo(Long estudianteId, Long cursoId, String periodo);

}
