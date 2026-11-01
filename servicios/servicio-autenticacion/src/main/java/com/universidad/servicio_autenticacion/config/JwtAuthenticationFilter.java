
package com.universidad.servicio_autenticacion.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.universidad.servicio_autenticacion.model.Usuario;
import com.universidad.servicio_autenticacion.repository.UsuarioRepository;
import com.universidad.servicio_autenticacion.service.JwtService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        SecurityContextHolder.clearContext();

        String authorization = request.getHeader("Authorization");

        if (authorization != null &&
                authorization.startsWith("Bearer ")) {

            String token = authorization.substring(7);

            try {
                Claims claims = jwtService.validarToken(token);

                String usuarioId = claims.getSubject();

                if (usuarioId != null && !usuarioId.isBlank()) {

                    Usuario usuario = usuarioRepository
                        .findById(usuarioId)
                        .orElse(null);

                    if (usuario != null
                            && usuario.isActivo()
                            && usuario.getRol() != null
                            && !usuario.getRol().isBlank()) {

                        var authorities = List.of(
                            new SimpleGrantedAuthority(
                                "ROLE_" + usuario.getRol()
                            )
                        );

                        var authentication =
                            new UsernamePasswordAuthenticationToken(
                                usuario.getId(),
                                null,
                                authorities
                            );

                        SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                    }
                }

            } catch (Exception ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
