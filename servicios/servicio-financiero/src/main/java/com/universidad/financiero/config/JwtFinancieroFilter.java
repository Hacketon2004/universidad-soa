package com.universidad.financiero.config;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
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

public class JwtFinancieroFilter extends OncePerRequestFilter {

    private final RestClient restClient;

    public JwtFinancieroFilter(String authUrl) {
        this.restClient = RestClient.create(authUrl);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if (request.getRequestURI().startsWith("/error")) {
            filterChain.doFilter(request, response);
            return;
        }

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
                response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token JWT invalido");
                return;
            }

            String usuarioId = String.valueOf(resultado.get("usuarioId"));
            String rol = String.valueOf(resultado.get("rol"));

            var autenticacion = new UsernamePasswordAuthenticationToken(
                    usuarioId,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + rol))
            );
            SecurityContextHolder.getContext().setAuthentication(autenticacion);

        } catch (RestClientResponseException ex) {
            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Token JWT invalido o expirado");
            return;
        } catch (Exception ex) {
            response.sendError(HttpStatus.BAD_GATEWAY.value(), "No se pudo verificar el token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
