package com.universidad.financiero.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("pagos")
public record Pago(
        @Id String id,
        String deudaId,
        @Indexed String estudianteId,
        BigDecimal monto,
        String metodo,
        LocalDateTime fechaPago) {
}
