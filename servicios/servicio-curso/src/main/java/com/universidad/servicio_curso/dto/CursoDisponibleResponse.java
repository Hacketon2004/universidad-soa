package com.universidad.servicio_curso.dto;

import java.util.ArrayList;
import java.util.List;

public class CursoDisponibleResponse {

    private CursoResponse curso;
    private boolean habilitado;
    private boolean esAdelanto;
    private boolean tieneCupo;
    private List<String> prerrequisitosFaltantes = new ArrayList<>();
    private String observacion;

    public CursoDisponibleResponse() {
    }

    public CursoResponse getCurso() {
        return curso;
    }

    public void setCurso(CursoResponse curso) {
        this.curso = curso;
    }

    public boolean isHabilitado() {
        return habilitado;
    }

    public void setHabilitado(boolean habilitado) {
        this.habilitado = habilitado;
    }

    public boolean isEsAdelanto() {
        return esAdelanto;
    }

    public void setEsAdelanto(boolean esAdelanto) {
        this.esAdelanto = esAdelanto;
    }

    public boolean isTieneCupo() {
        return tieneCupo;
    }

    public void setTieneCupo(boolean tieneCupo) {
        this.tieneCupo = tieneCupo;
    }

    public List<String> getPrerrequisitosFaltantes() {
        return prerrequisitosFaltantes;
    }

    public void setPrerrequisitosFaltantes(List<String> prerrequisitosFaltantes) {
        this.prerrequisitosFaltantes = prerrequisitosFaltantes;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }
}
