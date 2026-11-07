
package com.universidad.estudiante.config;

import java.io.IOException;
import java.util.Map;
import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtEstudianteFilter extends OncePerRequestFilter {

    private final RestClient restClient = RestClient.create("http://localhost:8081");

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token JWT obligatorio");
            return;
        }

        try {
            Map<String, Object> resultado = restClient.get()
                    .uri("/api/auth/validar")
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (resultado == null || !Boolean.TRUE.equals(resultado.get("valido"))) {
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token JWT inválido");
                return;
            }

            String rol = String.valueOf(resultado.get("rol"));
            String usuarioId = String.valueOf(resultado.get("usuarioId"));

            if (!List.of("ADMINISTRADOR", "SECRETARIA").contains(rol)) {
                response.sendError(HttpStatus.FORBIDDEN.value(), "No tienes permisos para acceder");
                return;
            }

            var autenticacion = new UsernamePasswordAuthenticationToken(
                    usuarioId,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + rol))
            );

            SecurityContextHolder.getContext().setAuthentication(autenticacion);

        } catch (RestClientResponseException ex) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token JWT inválido o expirado");
            return;
        } catch (Exception ex) {
            response.sendError(HttpStatus.BAD_GATEWAY.value(), "No se pudo verificar el token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
