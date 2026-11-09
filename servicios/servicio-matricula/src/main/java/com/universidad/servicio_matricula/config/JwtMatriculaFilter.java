package com.universidad.servicio_matricula.config;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtMatriculaFilter extends OncePerRequestFilter {

    private final RestClient restClient;

    public JwtMatriculaFilter(String authUrl) {
        this.restClient = RestClient.create(authUrl);
    }

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

        Map<?, ?> datos;

        try {
            datos = restClient.get()
                    .uri("/api/auth/validar")
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .body(Map.class);

        } catch (RestClientResponseException ex) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token JWT invalido o expirado");
            return;

        } catch (Exception ex) {
            response.sendError(HttpStatus.BAD_GATEWAY.value(), "No se pudo verificar el token");
            return;
        }

        if (datos == null || datos.get("rol") == null) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token JWT sin rol");
            return;
        }

        String usuarioId = String.valueOf(datos.get("usuarioId"));
        String rol = String.valueOf(datos.get("rol"));

        UsernamePasswordAuthenticationToken autenticacion =
                new UsernamePasswordAuthenticationToken(
                        usuarioId,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + rol))
                );

        SecurityContextHolder.getContext().setAuthentication(autenticacion);

        filterChain.doFilter(request, response);
    }
}
