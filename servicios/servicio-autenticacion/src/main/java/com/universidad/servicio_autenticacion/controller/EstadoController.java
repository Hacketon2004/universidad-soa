package com.universidad.servicio_autenticacion.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EstadoController {

    @GetMapping("/api/auth/estado")
    public Map<String, String> estado() {
        return Map.of(
            "servicio", "Autenticacion",
            "estado", "ACTIVO",
            "mensaje", "API funcionando correctamente"
        );
    }
}
