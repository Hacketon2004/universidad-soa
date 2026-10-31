
package com.universidad.servicio_autenticacion.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import io.jsonwebtoken.Claims;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import com.universidad.servicio_autenticacion.model.Usuario;

@Service
public class JwtService {

    private final SecretKey clave;

    public JwtService(@Value("${jwt.secret}") String secreto) {
        if (secreto.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException(
                "JWT_SECRET debe tener al menos 32 bytes"
            );
        }

        this.clave = Keys.hmacShaKeyFor(
            secreto.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();

        return Jwts.builder()
            .subject(usuario.getId())
            .claim("correo", usuario.getCorreo())
            .claim("rol", usuario.getRol())
            .issuedAt(Date.from(ahora))
            .expiration(Date.from(ahora.plusSeconds(3600)))
            .signWith(clave)
            .compact();
    }

    
public Claims validarToken(String token) {
    return Jwts.parser()
        .verifyWith(clave)
        .build()
        .parseSignedClaims(token)
        .getPayload();
}

}
