
package com.universidad.servicio_autenticacion.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.universidad.servicio_autenticacion.service.JwtService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (authorization != null &&
                authorization.startsWith("Bearer ")) {

            String token = authorization.substring(7);

            try {
                Claims claims = jwtService.validarToken(token);

                String usuarioId = claims.getSubject();
                String rol = claims.get("rol", String.class);

                if (usuarioId != null && !usuarioId.isBlank()
                        && rol != null && !rol.isBlank()) {

                    var authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + rol)
                    );

                    var authentication =
                        new UsernamePasswordAuthenticationToken(
                            usuarioId,
                            null,
                            authorities
                        );

                    SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
                }

            } catch (Exception ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
