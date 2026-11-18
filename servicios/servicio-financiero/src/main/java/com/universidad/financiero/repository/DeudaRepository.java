package com.universidad.financiero.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.universidad.financiero.model.Deuda;

public interface DeudaRepository extends MongoRepository<Deuda, String> {
    List<Deuda> findByEstudianteIdOrderByFechaVencimientoAsc(String estudianteId);
}
