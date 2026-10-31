
package com.universidad.servicio_autenticacion.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.universidad.servicio_autenticacion.model.Usuario;
import com.universidad.servicio_autenticacion.repository.UsuarioRepository;
import com.universidad.servicio_autenticacion.service.JwtService;

@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public record LoginRequest(
        String correo,
        String password
    ) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        if (request == null ||
            request.correo() == null ||
            request.correo().isBlank() ||
            request.password() == null ||
            request.password().isBlank()) {

            return ResponseEntity.badRequest().body(
                Map.of("mensaje", "Correo y contraseña son obligatorios")
            );
        }

        String correo = request.correo().trim().toLowerCase();

        Optional<Usuario> usuario =
            usuarioRepository.findByCorreo(correo);

        if (usuario.isEmpty() ||
            !passwordEncoder.matches(
                request.password(),
                usuario.get().getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                    "mensaje", "Credenciales incorrectas"
                ));
        }

        Usuario encontrado = usuario.get();

        String token = jwtService.generarToken(encontrado);

        return ResponseEntity.ok(Map.of(
            "mensaje", "Inicio de sesion correcto",
            "id", encontrado.getId(),
            "nombre", encontrado.getNombre(),
            "correo", encontrado.getCorreo(),
            "rol", encontrado.getRol(),
            "token", token,
            "tipo", "Bearer"
        ));
    }
}
