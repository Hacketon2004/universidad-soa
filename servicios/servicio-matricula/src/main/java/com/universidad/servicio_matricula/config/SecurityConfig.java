
package com.universidad.servicio_matricula.config;

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

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${auth.url}") String authUrl) throws Exception {

        return http
            .csrf(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/matriculas"
                ).hasAuthority("ROLE_ADMINISTRADOR")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/matriculas/*/anular"
                ).hasAuthority("ROLE_ADMINISTRADOR")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/matriculas/estudiante/*"
                ).hasAuthority("ROLE_ADMINISTRADOR")

                .anyRequest().denyAll()
            )
            .addFilterAfter(
                new JwtMatriculaFilter(authUrl),
                SecurityContextHolderFilter.class
            )
            .build();
    }
}
