package com.universidad.financiero.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.universidad.financiero.dto.Dtos.CrearDeudaRequest;
import com.universidad.financiero.dto.Dtos.DescuentoRequest;
import com.universidad.financiero.dto.Dtos.DeudaResponse;
import com.universidad.financiero.dto.Dtos.PagoRequest;
import com.universidad.financiero.dto.Dtos.PagoResponse;
import com.universidad.financiero.dto.Dtos.ResumenResponse;
import com.universidad.financiero.model.Comprobante;
import com.universidad.financiero.model.EstadoDeuda;
import com.universidad.financiero.model.Pago;
import com.universidad.financiero.service.FinancieroService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/financiero")
public class FinancieroController {

    private final FinancieroService servicio;

    public FinancieroController(FinancieroService servicio) {
        this.servicio = servicio;
    }

    // ----- Deudas -----

    @PostMapping("/deudas")
    @ResponseStatus(HttpStatus.CREATED)
    public DeudaResponse crearDeuda(@Valid @RequestBody CrearDeudaRequest req) {
        return servicio.crearDeuda(req);
    }

    @GetMapping("/deudas/{id}")
    public DeudaResponse obtenerDeuda(@PathVariable String id) {
        return servicio.obtenerDeuda(id);
    }

    @GetMapping("/deudas/estudiante/{estudianteId}")
    public List<DeudaResponse> deudasDeEstudiante(@PathVariable String estudianteId,
                                                  @RequestParam(required = false) EstadoDeuda estado) {
        return servicio.deudasDeEstudiante(estudianteId, estado);
    }

    @PostMapping("/deudas/{id}/descuento")
    public DeudaResponse aplicarDescuento(@PathVariable String id, @Valid @RequestBody DescuentoRequest req) {
        return servicio.aplicarDescuento(id, req);
    }

    @GetMapping("/estudiantes/{estudianteId}/resumen")
    public ResumenResponse resumen(@PathVariable String estudianteId) {
        return servicio.resumen(estudianteId);
    }

    // ----- Pagos -----

    @PostMapping("/pagos")
    @ResponseStatus(HttpStatus.CREATED)
    public PagoResponse registrarPago(@Valid @RequestBody PagoRequest req) {
        return servicio.registrarPago(req);
    }

    @GetMapping("/pagos/estudiante/{estudianteId}")
    public List<Pago> pagosDeEstudiante(@PathVariable String estudianteId) {
        return servicio.pagosDeEstudiante(estudianteId);
    }

    // ----- Comprobantes -----

    @GetMapping("/comprobantes/{numero}")
    public Comprobante comprobante(@PathVariable String numero) {
        return servicio.comprobantePorNumero(numero);
    }

    @GetMapping("/comprobantes/estudiante/{estudianteId}")
    public List<Comprobante> comprobantesDeEstudiante(@PathVariable String estudianteId) {
        return servicio.comprobantesDeEstudiante(estudianteId);
    }
}
