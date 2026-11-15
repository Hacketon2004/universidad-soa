
package com.universidad.servicio_autenticacion.config;

import com.universidad.servicio_autenticacion.repository.UsuarioRepository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.universidad.servicio_autenticacion.repository.UsuarioRepository;
import com.universidad.servicio_autenticacion.service.JwtService;

@Configuration
public class SecurityConfig {

    @Bean
public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtService jwtService,
        UsuarioRepository usuarioRepository) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
.authorizeHttpRequests(auth -> auth
    .requestMatchers(
    "/api/auth/estado",
    "/api/auth/registro",
    "/api/auth/login",
    "/swagger-ui/**",
    "/swagger-ui.html",
    "/v3/api-docs/**",
    "/error"
).permitAll()

.requestMatchers("/api/usuarios", "/api/usuarios/**")
    .hasRole("ADMINISTRADOR")

    .requestMatchers(
        "/api/auth/perfil",
        "/api/auth/validar"
    ).authenticated()

    .anyRequest().denyAll()
)

            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtService, usuarioRepository),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
