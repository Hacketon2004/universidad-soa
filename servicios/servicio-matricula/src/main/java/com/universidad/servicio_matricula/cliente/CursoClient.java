package com.universidad.servicio_matricula.cliente;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CursoClient {

    private static final Logger log = LoggerFactory.getLogger(CursoClient.class);

    private final RestClient restClient;
    private final boolean activa;

    public CursoClient(
            @Value("${curso.url}") String cursoUrl,
            @Value("${integracion.cursos.activa}") boolean activa) {

        SimpleClientHttpRequestFactory tiempos = new SimpleClientHttpRequestFactory();
        tiempos.setConnectTimeout(Duration.ofSeconds(3));
        tiempos.setReadTimeout(Duration.ofSeconds(5));

        this.restClient = RestClient.builder()
                .baseUrl(cursoUrl)
                .requestFactory(tiempos)
                .build();
        this.activa = activa;
    }

    public void reservarCupo(Long cursoId, String authorization) {
        if (!activa) {
            return;
        }

        try {
            restClient.put()
                    .uri("/api/cursos/{id}/reservar-cupo", cursoId)
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientResponseException ex) {
            int codigo = ex.getStatusCode().value();
            if (codigo == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe el curso con id " + cursoId);
            }
            if (codigo == 400) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El curso con id " + cursoId + " no esta activo o fue cancelado");
            }
            if (codigo == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "No hay vacantes disponibles en el curso con id " + cursoId);
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "El servicio de cursos respondio con error " + codigo);

        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El servicio de cursos no esta disponible");
        }
    }

    public void liberarCupo(Long cursoId, String authorization) {
        if (!activa) {
            return;
        }

        try {
            restClient.put()
                    .uri("/api/cursos/{id}/liberar-cupo", cursoId)
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientResponseException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "No se pudo liberar el cupo del curso " + cursoId
                            + " (error " + ex.getStatusCode().value() + ")");

        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El servicio de cursos no esta disponible");
        }
    }

    public void liberarCupoSinFallar(Long cursoId, String authorization) {
        try {
            liberarCupo(cursoId, authorization);
        } catch (Exception ex) {
            log.error("COMPENSACION FALLIDA: no se pudo devolver el cupo del curso {}. Revisar manualmente.", cursoId, ex);
        }
    }
}
