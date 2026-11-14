package com.universidad.servicio_matricula.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InOrder;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.universidad.servicio_matricula.cliente.CursoClient;
import com.universidad.servicio_matricula.cliente.EstudianteClient;
import com.universidad.servicio_matricula.model.EstadoMatricula;
import com.universidad.servicio_matricula.model.Matricula;
import com.universidad.servicio_matricula.repository.MatriculaRepository;

class MatriculaServiceTest {

    private static final String TOKEN = "Bearer token-de-prueba";

    private MatriculaRepository repositorio;
    private EstudianteClient estudiantes;
    private CursoClient cursos;
    private MatriculaService servicio;

    @BeforeEach
    void preparar() {
        repositorio = mock(MatriculaRepository.class);
        estudiantes = mock(EstudianteClient.class);
        cursos = mock(CursoClient.class);
        servicio = new MatriculaService(repositorio, estudiantes, cursos);
        when(repositorio.save(any(Matricula.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void registrarNueva_verificaEstudiante_reservaCupo_yGuarda_enEseOrden() {
        when(repositorio.findByEstudianteIdAndCursoIdAndPeriodo(1L, 101L, "2026-II")).thenReturn(Optional.empty());

        Matricula resultado = servicio.registrar(1L, 101L, "2026-II", TOKEN);

        assertEquals(1L, resultado.getEstudianteId());
        InOrder orden = inOrder(estudiantes, cursos, repositorio);
        orden.verify(estudiantes).verificarEstudianteActivo(1L, TOKEN);
        orden.verify(cursos).reservarCupo(101L, TOKEN);
        orden.verify(repositorio).save(any(Matricula.class));
    }

    @Test
    void duplicadaActiva_da409_yNoLlamaAOtrosServicios() {
        Matricula activa = new Matricula();
        activa.setEstado(EstadoMatricula.ACTIVA);
        when(repositorio.findByEstudianteIdAndCursoIdAndPeriodo(1L, 101L, "2026-II")).thenReturn(Optional.of(activa));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> servicio.registrar(1L, 101L, "2026-II", TOKEN));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verifyNoInteractions(estudiantes, cursos);
    }

    @Test
    void estudianteInexistente_noReservaCupo() {
        when(repositorio.findByEstudianteIdAndCursoIdAndPeriodo(9L, 101L, "2026-II")).thenReturn(Optional.empty());
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe"))
                .when(estudiantes).verificarEstudianteActivo(9L, TOKEN);

        assertThrows(ResponseStatusException.class, () -> servicio.registrar(9L, 101L, "2026-II", TOKEN));

        verifyNoInteractions(cursos);
        verify(repositorio, never()).save(any());
    }

    @Test
    void sinCupo_noGuardaMatricula() {
        when(repositorio.findByEstudianteIdAndCursoIdAndPeriodo(1L, 101L, "2026-II")).thenReturn(Optional.empty());
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Sin vacantes"))
                .when(cursos).reservarCupo(101L, TOKEN);

        assertThrows(ResponseStatusException.class, () -> servicio.registrar(1L, 101L, "2026-II", TOKEN));

        verify(repositorio, never()).save(any());
    }

    @Test
    void siFallaElGuardado_seDevuelveElCupo_compensacion() {
        when(repositorio.findByEstudianteIdAndCursoIdAndPeriodo(1L, 101L, "2026-II")).thenReturn(Optional.empty());
        when(repositorio.save(any(Matricula.class))).thenThrow(new RuntimeException("MySQL caido"));

        RuntimeException error = assertThrows(RuntimeException.class,
                () -> servicio.registrar(1L, 101L, "2026-II", TOKEN));

        assertEquals("MySQL caido", error.getMessage());
        verify(cursos).reservarCupo(101L, TOKEN);
        verify(cursos).liberarCupoSinFallar(101L, TOKEN);
    }

    @Test
    void reactivarAnulada_vuelveAReservarCupo() {
        Matricula anulada = new Matricula();
        anulada.setEstado(EstadoMatricula.ANULADA);
        when(repositorio.findByEstudianteIdAndCursoIdAndPeriodo(1L, 101L, "2026-II")).thenReturn(Optional.of(anulada));

        Matricula resultado = servicio.registrar(1L, 101L, "2026-II", TOKEN);

        assertEquals(EstadoMatricula.ACTIVA, resultado.getEstado());
        verify(cursos).reservarCupo(101L, TOKEN);
    }

    @Test
    void anular_primeroLiberaCupo_luegoGuarda() {
        Matricula activa = new Matricula();
        activa.setCursoId(101L);
        activa.setEstado(EstadoMatricula.ACTIVA);
        when(repositorio.findById(5L)).thenReturn(Optional.of(activa));

        Matricula resultado = servicio.anular(5L, TOKEN);

        assertEquals(EstadoMatricula.ANULADA, resultado.getEstado());
        InOrder orden = inOrder(cursos, repositorio);
        orden.verify(cursos).liberarCupo(101L, TOKEN);
        orden.verify(repositorio).save(activa);
    }

    @Test
    void anular_siCursosNoResponde_laMatriculaNoSeAnula() {
        Matricula activa = new Matricula();
        activa.setCursoId(101L);
        activa.setEstado(EstadoMatricula.ACTIVA);
        when(repositorio.findById(5L)).thenReturn(Optional.of(activa));
        doThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Cursos caido"))
                .when(cursos).liberarCupo(101L, TOKEN);

        assertThrows(ResponseStatusException.class, () -> servicio.anular(5L, TOKEN));

        assertEquals(EstadoMatricula.ACTIVA, activa.getEstado());
        verify(repositorio, never()).save(any());
    }
}
