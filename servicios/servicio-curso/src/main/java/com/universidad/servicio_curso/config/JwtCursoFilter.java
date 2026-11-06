package com.universidad.servicio_curso.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class JwtCursoFilter extends OncePerRequestFilter {

    private final RestClient restClient;

    public JwtCursoFilter(String authServiceUrl) {
        this.restClient = RestClient.create(authServiceUrl != null ? authServiceUrl : "http://localhost:8081");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Omitir endpoints de salud / swagger si existieran
        if (path.startsWith("/actuator") || path.startsWith("/error")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            response.sendError(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Token JWT obligatorio en cabecera Authorization (Bearer <token>)"
            );
            return;
        }

        try {
            Map<String, Object> body = restClient.get()
                    .uri("/api/auth/validar")
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (body != null && Boolean.TRUE.equals(body.get("valido"))) {
                String usuarioId = String.valueOf(body.get("usuarioId"));
                String rol = String.valueOf(body.get("rol"));

                List<SimpleGrantedAuthority> authorities = (rol != null && !rol.isBlank())
                        ? List.of(new SimpleGrantedAuthority("ROLE_" + rol))
                        : Collections.emptyList();

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(usuarioId, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token JWT invalido");
                return;
            }

        } catch (RestClientResponseException ex) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token JWT invalido o expirado");
            return;
        } catch (Exception ex) {
            response.sendError(HttpStatus.BAD_GATEWAY.value(), "No se pudo conectar con el servicio de autenticacion");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
