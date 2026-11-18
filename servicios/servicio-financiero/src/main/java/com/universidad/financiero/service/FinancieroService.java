package com.universidad.financiero.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.universidad.financiero.dto.Dtos.CrearDeudaRequest;
import com.universidad.financiero.dto.Dtos.DescuentoRequest;
import com.universidad.financiero.dto.Dtos.DeudaResponse;
import com.universidad.financiero.dto.Dtos.PagoRequest;
import com.universidad.financiero.dto.Dtos.PagoResponse;
import com.universidad.financiero.dto.Dtos.ResumenResponse;
import com.universidad.financiero.exception.RecursoNoEncontradoException;
import com.universidad.financiero.exception.ReglaNegocioException;
import com.universidad.financiero.model.Comprobante;
import com.universidad.financiero.model.Deuda;
import com.universidad.financiero.model.EstadoDeuda;
import com.universidad.financiero.model.Pago;
import com.universidad.financiero.repository.ComprobanteRepository;
import com.universidad.financiero.repository.DeudaRepository;
import com.universidad.financiero.repository.PagoRepository;

@Service
public class FinancieroService {

    private final DeudaRepository deudas;
    private final PagoRepository pagos;
    private final ComprobanteRepository comprobantes;

    public FinancieroService(DeudaRepository deudas, PagoRepository pagos, ComprobanteRepository comprobantes) {
        this.deudas = deudas;
        this.pagos = pagos;
        this.comprobantes = comprobantes;
    }

    // ---------- Deudas ----------

    public DeudaResponse crearDeuda(CrearDeudaRequest req) {
        Deuda deuda = new Deuda(null, req.estudianteId(), req.concepto(), req.descripcion(), req.periodo(),
                req.monto(), BigDecimal.ZERO, null, BigDecimal.ZERO, req.fechaVencimiento(), LocalDateTime.now());
        return aRespuesta(deudas.save(deuda));
    }

    public DeudaResponse obtenerDeuda(String id) {
        return aRespuesta(buscarDeuda(id));
    }

    public List<DeudaResponse> deudasDeEstudiante(String estudianteId, EstadoDeuda filtro) {
        return deudas.findByEstudianteIdOrderByFechaVencimientoAsc(estudianteId).stream()
                .map(this::aRespuesta)
                .filter(d -> filtro == null || d.estado() == filtro)
                .toList();
    }

    public DeudaResponse aplicarDescuento(String deudaId, DescuentoRequest req) {
        Deuda deuda = buscarDeuda(deudaId);
        BigDecimal nuevoDescuento = deuda.descuento().add(req.monto());
        BigDecimal maximo = deuda.montoOriginal().subtract(deuda.montoPagado());
        if (nuevoDescuento.compareTo(maximo) > 0) {
            throw new ReglaNegocioException("El descuento total (" + nuevoDescuento
                    + ") no puede superar lo que aun no se ha pagado (" + maximo + ")");
        }
        return aRespuesta(deudas.save(deuda.conDescuento(nuevoDescuento, req.motivo())));
    }

    public ResumenResponse resumen(String estudianteId) {
        LocalDate hoy = LocalDate.now();
        List<Deuda> pendientes = deudas.findByEstudianteIdOrderByFechaVencimientoAsc(estudianteId).stream()
                .filter(d -> d.saldo().signum() > 0)
                .toList();
        List<Deuda> vencidas = pendientes.stream().filter(d -> d.fechaVencimiento().isBefore(hoy)).toList();
        LocalDate proximo = pendientes.stream()
                .map(Deuda::fechaVencimiento)
                .filter(f -> !f.isBefore(hoy))
                .min(Comparator.naturalOrder())
                .orElse(null);
        return new ResumenResponse(estudianteId, sumarSaldos(pendientes), sumarSaldos(vencidas),
                pendientes.size(), vencidas.size(), proximo);
    }

    // ---------- Pagos y comprobantes ----------

    public PagoResponse registrarPago(PagoRequest req) {
        Deuda deuda = buscarDeuda(req.deudaId());
        BigDecimal saldo = deuda.saldo();
        if (saldo.signum() <= 0) {
            throw new ReglaNegocioException("La deuda ya esta pagada por completo");
        }
        if (req.monto().compareTo(saldo) > 0) {
            throw new ReglaNegocioException("El monto (" + req.monto() + ") supera el saldo pendiente (" + saldo + ")");
        }

        Pago pago = pagos.save(new Pago(null, deuda.id(), deuda.estudianteId(), req.monto(),
                req.metodo(), LocalDateTime.now()));
        Deuda actualizada = deudas.save(deuda.conMontoPagado(deuda.montoPagado().add(req.monto())));

        Comprobante comprobante = comprobantes.save(new Comprobante(null, generarNumero(), pago.id(),
                actualizada.id(), actualizada.estudianteId(), actualizada.concepto(), actualizada.descripcion(),
                req.monto(), actualizada.saldo(), req.metodo(), LocalDateTime.now()));
        return new PagoResponse(pago, comprobante);
    }

    public List<Pago> pagosDeEstudiante(String estudianteId) {
        return pagos.findByEstudianteIdOrderByFechaPagoDesc(estudianteId);
    }

    public Comprobante comprobantePorNumero(String numero) {
        return comprobantes.findByNumero(numero)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el comprobante " + numero));
    }

    public List<Comprobante> comprobantesDeEstudiante(String estudianteId) {
        return comprobantes.findByEstudianteIdOrderByEmitidoEnDesc(estudianteId);
    }

    // ---------- Auxiliares ----------

    private Deuda buscarDeuda(String id) {
        return deudas.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la deuda " + id));
    }

    private String generarNumero() {
        return "CMP-" + LocalDate.now().getYear() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BigDecimal sumarSaldos(List<Deuda> lista) {
        return lista.stream().map(Deuda::saldo).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private DeudaResponse aRespuesta(Deuda d) {
        LocalDate hoy = LocalDate.now();
        EstadoDeuda estado;
        if (d.saldo().signum() <= 0) {
            estado = EstadoDeuda.PAGADA;
        } else if (d.fechaVencimiento().isBefore(hoy)) {
            estado = EstadoDeuda.VENCIDA;
        } else if (d.montoPagado().signum() > 0) {
            estado = EstadoDeuda.PARCIAL;
        } else {
            estado = EstadoDeuda.PENDIENTE;
        }
        return new DeudaResponse(d.id(), d.estudianteId(), d.concepto(), d.descripcion(), d.periodo(),
                d.montoOriginal(), d.descuento(), d.motivoDescuento(), d.montoFinal(), d.montoPagado(),
                d.saldo(), d.fechaVencimiento(), ChronoUnit.DAYS.between(hoy, d.fechaVencimiento()), estado);
    }
}
