
package com.universidad.servicio_autenticacion.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PerfilController {

    @GetMapping("/api/auth/perfil")
    public Map<String, String> perfil(Authentication authentication) {
        return Map.of(
            "mensaje", "Acceso autorizado",
            "usuarioId", authentication.getName()
        );
    }
}
