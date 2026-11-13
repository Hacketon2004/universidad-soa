import { useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  ClipboardList,
  CircleCheck,
  CircleX,
  Ban,
  X,
} from "lucide-react";

import {
  obtenerMatriculasPorEstudiante,
  registrarMatricula,
  anularMatricula,
} from "../services/api";

import "./GestionUsuarios.css";

const FORMULARIO_VACIO = { estudianteId: "", cursoId: "", periodo: "2026-II" };

export default function GestionMatriculas({ token }) {
  const [estudianteId, setEstudianteId] = useState("");
  const [estudianteBuscado, setEstudianteBuscado] = useState(null);
  const [matriculas, setMatriculas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

  async function cargarMatriculas(id) {
    if (!id) {
      setError("Ingresa el ID del estudiante.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const datos = await obtenerMatriculasPorEstudiante(token, id);
      setMatriculas(datos);
      setEstudianteBuscado(id);
    } catch (err) {
      setError(err.message);
      setMatriculas([]);
    } finally {
      setCargando(false);
    }
  }

  function buscar(evento) {
    evento.preventDefault();
    setMensaje("");
    cargarMatriculas(estudianteId.trim());
  }

  function abrirModal() {
    setFormulario({ ...FORMULARIO_VACIO, estudianteId: estudianteBuscado || "" });
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    setModalAbierto(false);
    setError("");
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  }

  async function guardarMatricula(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError("");

    try {
      const datos = {
        estudianteId: Number(formulario.estudianteId),
        cursoId: Number(formulario.cursoId),
        periodo: formulario.periodo.trim(),
      };

      await registrarMatricula(token, datos);

      setMensaje("Matrícula registrada correctamente.");
      setModalAbierto(false);
      setEstudianteId(String(datos.estudianteId));
      await cargarMatriculas(String(datos.estudianteId));
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function anular(matricula) {
    const confirmado = window.confirm(
      `¿Deseas anular la matrícula ${matricula.id} (curso ${matricula.cursoId}, ${matricula.periodo})?`,
    );
    if (!confirmado) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await anularMatricula(token, matricula.id);
      setMensaje("Matrícula anulada correctamente.");
      await cargarMatriculas(estudianteBuscado);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const activas = matriculas.filter((m) => m.estado === "ACTIVA").length;
  const anuladas = matriculas.filter((m) => m.estado === "ANULADA").length;

  return (
    <section className="gestion-usuarios">
      <div className="usuarios-cabecera">
        <div>
          <span className="usuarios-etiqueta">ACADÉMICO</span>
          <h1>Gestión de Matrículas</h1>
          <p>Registra, consulta y anula matrículas por estudiante.</p>
        </div>

        <button className="usuarios-boton-principal" onClick={abrirModal}>
          <Plus size={18} />
          Nueva matrícula
        </button>
      </div>

      <div className="usuarios-resumen">
        <div>
          <ClipboardList size={23} />
          <span>Total del estudiante</span>
          <strong>{matriculas.length}</strong>
        </div>
        <div>
          <CircleCheck size={23} />
          <span>Activas</span>
          <strong>{activas}</strong>
        </div>
        <div>
          <CircleX size={23} />
          <span>Anuladas</span>
          <strong>{anuladas}</strong>
        </div>
      </div>

      <div className="usuarios-panel">
        <form className="usuarios-herramientas" onSubmit={buscar}>
          <div className="usuarios-busqueda">
            <Search size={19} />
            <input
              type="number"
              min="1"
              placeholder="ID del estudiante (ej. 1)"
              value={estudianteId}
              onChange={(e) => setEstudianteId(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="usuarios-boton-secundario"
            disabled={cargando}
          >
            <Search size={18} />
            Buscar
          </button>

          <button
            type="button"
            className="usuarios-boton-secundario"
            onClick={() => cargarMatriculas(estudianteBuscado)}
            disabled={cargando || !estudianteBuscado}
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </form>

        {mensaje && (
          <p className="usuarios-exito" role="status">
            {mensaje}
          </p>
        )}

        {error && !modalAbierto && (
          <p className="usuarios-error" role="alert">
            {error}
          </p>
        )}

        {cargando ? (
          <p className="usuarios-vacio">Cargando matrículas...</p>
        ) : !estudianteBuscado ? (
          <p className="usuarios-vacio">
            Ingresa el ID de un estudiante para ver sus matrículas.
          </p>
        ) : (
          <div className="usuarios-tabla-contenedor">
            <table className="usuarios-tabla">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Curso</th>
                  <th>Periodo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {matriculas.map((matricula) => (
                  <tr key={matricula.id}>
                    <td>{matricula.id}</td>
                    <td>{matricula.cursoId}</td>
                    <td>{matricula.periodo}</td>
                    <td>
                      {new Date(matricula.fechaMatricula).toLocaleString("es-PE")}
                    </td>
                    <td>
                      <span
                        className={
                          matricula.estado === "ACTIVA"
                            ? "usuarios-estado activo"
                            : "usuarios-estado inactivo"
                        }
                      >
                        {matricula.estado === "ACTIVA" ? "Activa" : "Anulada"}
                      </span>
                    </td>
                    <td>
                      <div className="usuarios-acciones">
                        {matricula.estado === "ACTIVA" ? (
                          <button
                            title="Anular matrícula"
                            onClick={() => anular(matricula)}
                            disabled={guardando}
                          >
                            <Ban size={17} />
                          </button>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {matriculas.length === 0 && (
              <p className="usuarios-vacio">
                Este estudiante no tiene matrículas.
              </p>
            )}
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="usuarios-modal-fondo">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Nueva matrícula"
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={cerrarModal}
              disabled={guardando}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <form onSubmit={guardarMatricula} className="usuarios-formulario">
              <h3>Nueva matrícula</h3>

              <label htmlFor="matricula-estudiante">ID del estudiante</label>
              <input
                id="matricula-estudiante"
                name="estudianteId"
                type="number"
                min="1"
                value={formulario.estudianteId}
                onChange={cambiarCampo}
                required
              />

              <label htmlFor="matricula-curso">ID del curso</label>
              <input
                id="matricula-curso"
                name="cursoId"
                type="number"
                min="1"
                value={formulario.cursoId}
                onChange={cambiarCampo}
                required
              />

              <label htmlFor="matricula-periodo">Periodo</label>
              <input
                id="matricula-periodo"
                name="periodo"
                type="text"
                placeholder="2026-II"
                value={formulario.periodo}
                onChange={cambiarCampo}
                required
              />

              {error && (
                <p className="usuarios-error" role="alert">
                  {error}
                </p>
              )}

              <div className="usuarios-formulario-acciones">
                <button type="button" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}