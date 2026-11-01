
package com.universidad.servicio_autenticacion.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ValidacionController {

    @GetMapping("/api/auth/validar")
    public Map<String, Object> validar(Authentication authentication) {

        String rol = authentication.getAuthorities()
            .iterator()
            .next()
            .getAuthority()
            .replaceFirst("^ROLE_", "");

        return Map.of(
            "valido", true,
            "usuarioId", authentication.getName(),
            "rol", rol
        );
    }
}
