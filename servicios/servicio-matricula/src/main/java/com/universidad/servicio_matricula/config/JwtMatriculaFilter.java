
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

    private final RestClient restClient =
        RestClient.create("http://localhost:8081");

    @Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
) throws ServletException, IOException {

    String authorization = request.getHeader(
            HttpHeaders.AUTHORIZATION
    );

    if (authorization == null
            || !authorization.startsWith("Bearer ")) {

        response.sendError(
                HttpStatus.UNAUTHORIZED.value(),
                "Token JWT obligatorio"
        );
        return;
    }

    try {
        restClient.get()
                .uri("/api/auth/validar")
                .header(HttpHeaders.AUTHORIZATION, authorization)
                .retrieve()
                .toBodilessEntity();

    } catch (RestClientResponseException ex) {
        response.sendError(
                HttpStatus.UNAUTHORIZED.value(),
                "Token JWT invalido o expirado"
        );
        return;

    } catch (Exception ex) {
        response.sendError(
                HttpStatus.BAD_GATEWAY.value(),
                "No se pudo verificar el token"
        );
        return;
    }

    filterChain.doFilter(request, response);
}
}