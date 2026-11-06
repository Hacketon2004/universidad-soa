package com.universidad.servicio_curso.repository;

import com.universidad.servicio_curso.model.Curso;
import com.universidad.servicio_curso.model.EstadoCurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {

    Optional<Curso> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Curso> findByActivoTrue();

    List<Curso> findByCicloAndActivoTrue(Integer ciclo);

    List<Curso> findByDocenteIdAndActivoTrue(Long docenteId);

    List<Curso> findByEstadoAndActivoTrue(EstadoCurso estado);

    List<Curso> findByActivoTrueOrderByCicloAscCodigoAsc();

    @Query("SELECT c FROM Curso c LEFT JOIN FETCH c.prerrequisitos WHERE c.id = :id AND c.activo = true")
    Optional<Curso> findByIdConPrerrequisitos(@Param("id") Long id);

    @Query("SELECT DISTINCT c FROM Curso c LEFT JOIN FETCH c.prerrequisitos WHERE c.activo = true ORDER BY c.ciclo ASC, c.codigo ASC")
    List<Curso> findAllActivosConPrerrequisitos();
}
