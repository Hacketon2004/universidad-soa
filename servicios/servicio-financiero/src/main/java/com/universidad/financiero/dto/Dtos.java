package com.universidad.financiero.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.universidad.financiero.model.Comprobante;
import com.universidad.financiero.model.Concepto;
import com.universidad.financiero.model.EstadoDeuda;
import com.universidad.financiero.model.Pago;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class Dtos {

    private Dtos() {}

    public record CrearDeudaRequest(
            @NotBlank String estudianteId,
            @NotNull Concepto concepto,
            String descripcion,
            String periodo,
            @NotNull @DecimalMin("0.01") BigDecimal monto,
            @NotNull LocalDate fechaVencimiento) {}

    public record DescuentoRequest(
            @NotNull @DecimalMin("0.01") BigDecimal monto,
            @NotBlank String motivo) {}

    public record PagoRequest(
            @NotBlank String deudaId,
            @NotNull @DecimalMin("0.01") BigDecimal monto,
            @NotBlank String metodo) {}

    public record DeudaResponse(
            String id,
            String estudianteId,
            Concepto concepto,
            String descripcion,
            String periodo,
            BigDecimal montoOriginal,
            BigDecimal descuento,
            String motivoDescuento,
            BigDecimal montoFinal,
            BigDecimal montoPagado,
            BigDecimal saldo,
            LocalDate fechaVencimiento,
            long diasParaVencer,
            EstadoDeuda estado) {}

    public record PagoResponse(Pago pago, Comprobante comprobante) {}

    public record ResumenResponse(
            String estudianteId,
            BigDecimal totalPendiente,
            BigDecimal totalVencido,
            int deudasPendientes,
            int deudasVencidas,
            LocalDate proximoVencimiento) {}
}
