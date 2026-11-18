package com.universidad.financiero.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("comprobantes")
public record Comprobante(
        @Id String id,
        @Indexed(unique = true) String numero,
        String pagoId,
        String deudaId,
        @Indexed String estudianteId,
        Concepto concepto,
        String descripcion,
        BigDecimal montoPagado,
        BigDecimal saldoRestante,
        String metodo,
        LocalDateTime emitidoEn) {
}
