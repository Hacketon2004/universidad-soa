
package com.universidad.servicio_autenticacion.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.universidad.servicio_autenticacion.model.Usuario;
import com.universidad.servicio_autenticacion.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/auth")
public class RegistroController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public RegistroController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record RegistroRequest(
        String nombre,
        String correo,
        String password
    ) {}

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(
            @RequestBody RegistroRequest request) {

        if (request.nombre() == null
                || request.nombre().isBlank()
                || request.correo() == null
                || request.correo().isBlank()
                || request.password() == null
                || request.password().length() < 8) {

            return ResponseEntity.badRequest().body(
                Map.of("mensaje", "Datos invalidos. La contraseña debe tener al menos 8 caracteres.")
            );
        }

        String correo = request.correo().trim().toLowerCase();

        if (usuarioRepository.existsByCorreo(correo)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("mensaje", "El correo ya esta registrado")
            );
        }

        Usuario usuario = new Usuario(
            request.nombre().trim(),
            correo,
            passwordEncoder.encode(request.password()),
            "ESTUDIANTE"
        );

        Usuario guardado = usuarioRepository.save(usuario);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
                "mensaje", "Usuario registrado correctamente",
                "id", guardado.getId(),
                "correo", guardado.getCorreo(),
                "rol", guardado.getRol()
            )
        );
    }
}
