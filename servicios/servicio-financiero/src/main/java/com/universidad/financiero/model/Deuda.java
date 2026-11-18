package com.universidad.financiero.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("deudas")
public record Deuda(
        @Id String id,
        @Indexed String estudianteId,
        Concepto concepto,
        String descripcion,
        String periodo,
        BigDecimal montoOriginal,
        BigDecimal descuento,
        String motivoDescuento,
        BigDecimal montoPagado,
        LocalDate fechaVencimiento,
        LocalDateTime creadoEn) {

    public BigDecimal montoFinal() {
        return montoOriginal.subtract(descuento);
    }

    public BigDecimal saldo() {
        return montoFinal().subtract(montoPagado);
    }

    public Deuda conDescuento(BigDecimal nuevoDescuento, String motivo) {
        return new Deuda(id, estudianteId, concepto, descripcion, periodo, montoOriginal,
                nuevoDescuento, motivo, montoPagado, fechaVencimiento, creadoEn);
    }

    public Deuda conMontoPagado(BigDecimal nuevoMontoPagado) {
        return new Deuda(id, estudianteId, concepto, descripcion, periodo, montoOriginal,
                descuento, motivoDescuento, nuevoMontoPagado, fechaVencimiento, creadoEn);
    }
}
