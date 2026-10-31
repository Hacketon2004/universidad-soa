
package com.universidad.servicio_autenticacion.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.universidad.servicio_autenticacion.model.Usuario;

public interface UsuarioRepository
        extends MongoRepository<Usuario, String> {

    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);
}
