package com.universidad.api_gateway.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtGatewayFilter extends OncePerRequestFilter {

    private final RestClient restClient;

    public JwtGatewayFilter(@Value("${auth.url}") String authUrl) {
        this.restClient = RestClient.create(authUrl);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String ruta = request.getRequestURI();

        return ruta.equals("/api/auth/login")
                || ruta.equals("/api/auth/registro")
                || ruta.equals("/api/auth/estado");
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

        try {
            restClient.get()
                    .uri("/api/auth/validar")
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .toBodilessEntity();

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
