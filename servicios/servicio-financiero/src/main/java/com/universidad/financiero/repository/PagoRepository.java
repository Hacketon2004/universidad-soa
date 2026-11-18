package com.universidad.financiero.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.universidad.financiero.model.Pago;

public interface PagoRepository extends MongoRepository<Pago, String> {
    List<Pago> findByEstudianteIdOrderByFechaPagoDesc(String estudianteId);
}
