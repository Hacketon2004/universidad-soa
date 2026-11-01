
package com.universidad.servicio_autenticacion.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import com.universidad.servicio_autenticacion.model.Usuario;
import com.universidad.servicio_autenticacion.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private static final Set<String> ROLES_VALIDOS = Set.of(
        "ADMINISTRADOR",
        "SECRETARIA",
        "DOCENTE",
        "ESTUDIANTE"
    );

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record UsuarioRespuesta(
        String id,
        String nombre,
        String correo,
        String rol,
        boolean activo
    ) {}

    public record CrearUsuarioRequest(
        String nombre,
        String correo,
        String password,
        String rol
    ) {}

    public record EditarUsuarioRequest(
        String nombre,
        String correo,
        String rol
    ) {}

    private UsuarioRespuesta convertirRespuesta(Usuario usuario) {
        return new UsuarioRespuesta(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getCorreo(),
            usuario.getRol(),
            usuario.isActivo()
        );
    }

    private boolean nombreValido(String nombre) {
        return nombre != null && !nombre.isBlank();
    }

    private boolean correoValido(String correo) {
        return correo != null
            && correo.trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }

    private boolean rolValido(String rol) {
        return rol != null && ROLES_VALIDOS.contains(rol);
    }

    // LISTAR USUARIOS
    @GetMapping
    public ResponseEntity<List<UsuarioRespuesta>> listarUsuarios() {

        List<UsuarioRespuesta> usuarios = usuarioRepository
            .findAll()
            .stream()
            .map(this::convertirRespuesta)
            .toList();

        return ResponseEntity.ok(usuarios);
    }

    // CREAR USUARIO
    @PostMapping
    public ResponseEntity<?> crearUsuario(
            @RequestBody CrearUsuarioRequest request) {

        if (request == null
                || !nombreValido(request.nombre())
                || !correoValido(request.correo())
                || request.password() == null
                || request.password().length() < 12
                || !rolValido(request.rol())) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "mensaje",
                    "Datos invalidos. Verifica nombre, correo, rol y contraseña (minimo 12 caracteres)."
                )
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
            request.rol()
        );

        usuario.setActivo(true);

        Usuario guardado = usuarioRepository.save(usuario);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(convertirRespuesta(guardado));
    }

    // EDITAR USUARIO
    @PutMapping("/{id}")
    public ResponseEntity<?> editarUsuario(
            @PathVariable String id,
            @RequestBody EditarUsuarioRequest request) {

        if (request == null
                || !nombreValido(request.nombre())
                || !correoValido(request.correo())
                || !rolValido(request.rol())) {

            return ResponseEntity.badRequest().body(
                Map.of("mensaje", "Nombre, correo o rol invalidos")
            );
        }

        Usuario usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("mensaje", "Usuario no encontrado")
            );
        }

        String correo = request.correo().trim().toLowerCase();

        var usuarioConCorreo = usuarioRepository.findByCorreo(correo);

        if (usuarioConCorreo.isPresent()
                && !usuarioConCorreo.get().getId().equals(id)) {

            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("mensaje", "El correo ya pertenece a otro usuario")
            );
        }

        usuario.setNombre(request.nombre().trim());
        usuario.setCorreo(correo);
        usuario.setRol(request.rol());

        Usuario actualizado = usuarioRepository.save(usuario);

        return ResponseEntity.ok(convertirRespuesta(actualizado));
    }

    
    public record CambiarEstadoRequest(
        Boolean activo
    ) {}

    // ACTIVAR O DESACTIVAR USUARIO
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable String id,
            @RequestBody CambiarEstadoRequest request,
            Authentication authentication) {

        if (request == null || request.activo() == null) {
            return ResponseEntity.badRequest().body(
                Map.of("mensaje", "Debes indicar el estado del usuario")
            );
        }

        Usuario usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("mensaje", "Usuario no encontrado")
            );
        }

        // Impedir que el administrador desactive su propia cuenta
        if (!request.activo()
                && usuario.getId().equals(authentication.getName())) {
            return ResponseEntity.badRequest().body(
                Map.of("mensaje", "No puedes desactivar tu propia cuenta")
            );
        }

        usuario.setActivo(request.activo());

        Usuario actualizado = usuarioRepository.save(usuario);

        return ResponseEntity.ok(
            Map.of(
                "mensaje", request.activo()
                    ? "Usuario activado correctamente"
                    : "Usuario desactivado correctamente",
                "usuario", convertirRespuesta(actualizado)
            )
        );
    }

    
    public record RestablecerPasswordRequest(
        String nuevaPassword
    ) {}

    // RESTABLECER CONTRASEÑA DE UN USUARIO
    @PatchMapping("/{id}/password")
    public ResponseEntity<?> restablecerPassword(
            @PathVariable String id,
            @RequestBody RestablecerPasswordRequest request) {

        if (request == null
                || request.nuevaPassword() == null
                || request.nuevaPassword().length() < 12) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "mensaje",
                    "La nueva contraseña debe tener al menos 12 caracteres"
                )
            );
        }

        Usuario usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("mensaje", "Usuario no encontrado")
            );
        }

        usuario.setPassword(
            passwordEncoder.encode(request.nuevaPassword())
        );

        usuarioRepository.save(usuario);

        return ResponseEntity.ok(
            Map.of("mensaje", "Contraseña restablecida correctamente")
        );
    }


}
