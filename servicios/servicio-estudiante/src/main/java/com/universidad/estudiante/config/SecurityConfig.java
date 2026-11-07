package com.universidad.estudiante.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtEstudianteFilter jwtEstudianteFilter;

    public SecurityConfig(JwtEstudianteFilter jwtEstudianteFilter) {
        this.jwtEstudianteFilter = jwtEstudianteFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                )
            )
            .authorizeHttpRequests(auth -> auth
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtEstudianteFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public FilterRegistrationBean<JwtEstudianteFilter> jwtFilterRegistration(
            JwtEstudianteFilter filter) {

        FilterRegistrationBean<JwtEstudianteFilter> registration =
                new FilterRegistrationBean<>(filter);

        registration.setEnabled(false);

        return registration;
    }
}