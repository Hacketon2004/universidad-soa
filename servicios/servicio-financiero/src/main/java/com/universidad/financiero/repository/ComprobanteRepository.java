package com.universidad.financiero.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.universidad.financiero.model.Comprobante;

public interface ComprobanteRepository extends MongoRepository<Comprobante, String> {
    Optional<Comprobante> findByNumero(String numero);
    List<Comprobante> findByEstudianteIdOrderByEmitidoEnDesc(String estudianteId);
}
