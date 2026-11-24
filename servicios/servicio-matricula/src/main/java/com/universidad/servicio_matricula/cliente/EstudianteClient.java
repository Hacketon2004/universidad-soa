package com.universidad.servicio_matricula.cliente;

import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class EstudianteClient {

    private final RestClient restClient;
    private final boolean activa;

    public EstudianteClient(
            @Value("${estudiante.url}") String estudianteUrl,
            @Value("${integracion.estudiantes.activa}") boolean activa) {

        SimpleClientHttpRequestFactory tiempos = new SimpleClientHttpRequestFactory();
        tiempos.setConnectTimeout(Duration.ofSeconds(3));
        tiempos.setReadTimeout(Duration.ofSeconds(5));

        this.restClient = RestClient.builder()
                .baseUrl(estudianteUrl)
                .requestFactory(tiempos)
                .build();
        this.activa = activa;
    }

    public void verificarEstudianteActivo(Long estudianteId, String authorization) {
        if (!activa) {
            return;
        }

        Map<String, Object> estudiante;
        try {
            estudiante = restClient.get()
                    .uri("/api/estudiantes/{id}", estudianteId)
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe el estudiante con id " + estudianteId);
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "El servicio de estudiantes respondio con error " + ex.getStatusCode().value());

        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El servicio de estudiantes no esta disponible");
        }

        if (estudiante == null || !Boolean.TRUE.equals(estudiante.get("activo"))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El estudiante con id " + estudianteId + " no esta activo");
        }
    }

    // Para consultar: devuelve el id de la ficha vinculada al usuario (aunque este inactivo)
    public Long obtenerIdPorUsuario(String usuarioId, String authorization) {
        return extraerId(consultarPorUsuario(usuarioId, authorization));
    }

    // Para matricularse: ademas exige que el estudiante este activo
    public Long obtenerIdActivoPorUsuario(String usuarioId, String authorization) {
        Map<String, Object> estudiante = consultarPorUsuario(usuarioId, authorization);
        if (!Boolean.TRUE.equals(estudiante.get("activo"))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Tu ficha de estudiante no está activa. Comunícate con secretaría.");
        }
        return extraerId(estudiante);
    }

    private Map<String, Object> consultarPorUsuario(String usuarioId, String authorization) {
        if (!activa) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "La consulta al servicio de estudiantes no esta activa");
        }

        Map<String, Object> estudiante;
        try {
            estudiante = restClient.get()
                    .uri("/api/estudiantes/usuario/{usuarioId}", usuarioId)
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tu usuario no está vinculado a ningún estudiante. "
                                + "Pide a secretaria que registre tu ficha con este ID de usuario: " + usuarioId);
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "El servicio de estudiantes respondio con error " + ex.getStatusCode().value());

        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El servicio de estudiantes no esta disponible");
        }

        if (estudiante == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "El servicio de estudiantes no devolvio datos");
        }
        return estudiante;
    }

    private Long extraerId(Map<String, Object> estudiante) {
        if (!(estudiante.get("id") instanceof Number id)) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "El servicio de estudiantes no devolvio el id");
        }
        return id.longValue();
    }
}
