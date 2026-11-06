package com.universidad.servicio_curso.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;

@Configuration
public class SecurityConfig {

    @Value("${auth.service.url:http://localhost:8081}")
    private String authServiceUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Consultas públicas/autenticadas para Estudiantes, Docentes y Admins
                        .requestMatchers(HttpMethod.GET, "/api/cursos/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/cursos/disponibles").authenticated()

                        // 2. Operaciones de integración con microservicio de Matrícula (gestión de vacantes)
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/*/reservar-cupo").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/*/liberar-cupo").authenticated()

                        // 3. Operaciones de gestión académica reservadas a Administrador
                        .requestMatchers(HttpMethod.POST, "/api/cursos").hasAuthority("ROLE_ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/*/docente").hasAuthority("ROLE_ADMINISTRADOR")
                        .requestMatchers(HttpMethod.POST, "/api/cursos/*/cancelar").hasAuthority("ROLE_ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/cursos/*").hasAuthority("ROLE_ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/cursos/*").hasAuthority("ROLE_ADMINISTRADOR")

                        .anyRequest().authenticated()
                )
                .addFilterAfter(new JwtCursoFilter(authServiceUrl), SecurityContextHolderFilter.class)
                .build();
    }
}
