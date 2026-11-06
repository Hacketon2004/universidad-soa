package com.universidad.servicio_curso.dto;

import java.util.ArrayList;
import java.util.List;

public class ConsultaDisponibilidadRequest {

    private List<Long> cursosAprobadosIds = new ArrayList<>();
    private Integer cicloEstudiante = 1;

    public ConsultaDisponibilidadRequest() {
    }

    public ConsultaDisponibilidadRequest(List<Long> cursosAprobadosIds, Integer cicloEstudiante) {
        this.cursosAprobadosIds = cursosAprobadosIds;
        this.cicloEstudiante = cicloEstudiante;
    }

    public List<Long> getCursosAprobadosIds() {
        return cursosAprobadosIds;
    }

    public void setCursosAprobadosIds(List<Long> cursosAprobadosIds) {
        this.cursosAprobadosIds = cursosAprobadosIds;
    }

    public Integer getCicloEstudiante() {
        return cicloEstudiante;
    }

    public void setCicloEstudiante(Integer cicloEstudiante) {
        this.cicloEstudiante = cicloEstudiante;
    }
}
