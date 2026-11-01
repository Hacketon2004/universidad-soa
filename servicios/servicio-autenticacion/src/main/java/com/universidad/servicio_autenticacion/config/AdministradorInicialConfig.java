
package com.universidad.servicio_autenticacion.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.universidad.servicio_autenticacion.model.Usuario;
import com.universidad.servicio_autenticacion.repository.UsuarioRepository;

@Configuration
public class AdministradorInicialConfig {

    @Bean
    public ApplicationRunner crearAdministradorInicial(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            Environment environment) {

        return args -> {
            String habilitado = environment.getProperty(
                "ADMIN_INICIAL_HABILITADO", "false"
            );

            if (!"true".equalsIgnoreCase(habilitado)) {
                return;
            }

            String nombre = environment.getProperty(
                "ADMIN_INICIAL_NOMBRE", "Administrador General"
            );

            String correo = environment.getProperty(
                "ADMIN_INICIAL_CORREO"
            );

            String password = environment.getProperty(
                "ADMIN_INICIAL_PASSWORD"
            );

            if (correo == null || correo.isBlank()
                    || password == null || password.length() < 12) {
                throw new IllegalStateException(
                    "Configura ADMIN_INICIAL_CORREO y " +
                    "ADMIN_INICIAL_PASSWORD (mínimo 12 caracteres)"
                );
            }

            correo = correo.trim().toLowerCase();

            if (usuarioRepository.existsByCorreo(correo)) {
                System.out.println(
                    "La cuenta inicial ya existe. No se modificó."
                );
                return;
            }

            Usuario administrador = new Usuario(
                nombre.trim(),
                correo,
                passwordEncoder.encode(password),
                "ADMINISTRADOR"
            );

            administrador.setActivo(true);

            usuarioRepository.save(administrador);

            System.out.println(
                "Administrador inicial creado correctamente: " + correo
            );
        };
    }
}
