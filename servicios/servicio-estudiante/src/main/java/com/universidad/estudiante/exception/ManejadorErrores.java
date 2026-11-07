
package com.universidad.estudiante.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ManejadorErrores {

    // ERROR 404: ESTUDIANTE NO ENCONTRADO
    @ExceptionHandler(EstudianteNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarNoEncontrado(
            EstudianteNoEncontradoException ex) {

        return crearRespuesta(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // ERROR 409: CONFLICTO DE DATOS
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> manejarConflicto(
            IllegalStateException ex) {

        return crearRespuesta(HttpStatus.CONFLICT, ex.getMessage());
    }

    // ERROR 400: ERROR DE NEGOCIO
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> manejarErrorNegocio(
            IllegalArgumentException ex) {

        return crearRespuesta(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // ERROR 400: VALIDACIONES
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(
            MethodArgumentNotValidException ex) {

        Map<String, String> errores = new LinkedHashMap<>();

        ex.getBindingResult().getFieldErrors()
                .forEach(error ->
                        errores.put(error.getField(), error.getDefaultMessage()));

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestamp", LocalDateTime.now().toString());
        cuerpo.put("status", HttpStatus.BAD_REQUEST.value());
        cuerpo.put("mensaje", "Datos inválidos");
        cuerpo.put("errores", errores);

        return ResponseEntity.badRequest().body(cuerpo);
    }

    private ResponseEntity<Map<String, Object>> crearRespuesta(
            HttpStatus estado, String mensaje) {

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestamp", LocalDateTime.now().toString());
        cuerpo.put("status", estado.value());
        cuerpo.put("mensaje", mensaje);

        return ResponseEntity.status(estado).body(cuerpo);
    }
}
