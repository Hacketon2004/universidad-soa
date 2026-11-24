import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  ClipboardList,
  CircleCheck,
  CircleX,
  X,
} from "lucide-react";

import {
  obtenerMisMatriculas,
  obtenerCursos,
  matricularme,
} from "../services/api";
import SelectorBuscable from "./SelectorBuscable";
import "./GestionUsuarios.css";

export default function MisMatriculas({ token }) {
  const [matriculas, setMatriculas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cursoElegido, setCursoElegido] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const [datosMatriculas, datosCursos] = await Promise.all([
        obtenerMisMatriculas(token),
        obtenerCursos(token).catch(() => []),
      ]);
      setMatriculas(Array.isArray(datosMatriculas) ? datosMatriculas : []);
      setCursos(Array.isArray(datosCursos) ? datosCursos : []);
    } catch (err) {
      setMatriculas([]);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [token]);

  function nombreCurso(cursoId) {
    const curso = cursos.find((c) => String(c.id) === String(cursoId));
    return curso ? `${curso.codigo} - ${curso.nombre}` : `Curso ${cursoId}`;
  }

  // Cursos donde se puede matricular: activos, con cupo y donde aun no tiene matricula activa
  const opcionesCursos = useMemo(() => {
    const yaMatriculado = new Set(
      matriculas
        .filter((m) => m.estado === "ACTIVA")
        .map((m) => String(m.cursoId))
    );

    return cursos
      .filter(
        (c) =>
          c.activo === true &&
          c.estado === "ACTIVO" &&
          c.cuposDisponibles > 0 &&
          !yaMatriculado.has(String(c.id))
      )
      .map((c) => ({
        valor: String(c.id),
        titulo: `${c.codigo} - ${c.nombre}`,
        detalle: `Ciclo ${c.ciclo} · ${c.creditos} créditos · ${c.cuposDisponibles}/${c.cuposTotales} cupos`,
      }));
  }, [cursos, matriculas]);

  function abrirModal() {
    setCursoElegido("");
    setErrorModal("");
    setMensaje("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (!guardando) {
      setModalAbierto(false);
    }
  }

  async function confirmarMatricula(evento) {
    evento.preventDefault();

    if (!cursoElegido) {
      setErrorModal("Elige un curso.");
      return;
    }

    setGuardando(true);
    setErrorModal("");
    try {
      await matricularme(token, Number(cursoElegido));
      setModalAbierto(false);
      setMensaje("Te matriculaste correctamente.");
      await cargar();
    } catch (err) {
      setErrorModal(err.message);
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
          <h1>Mis matrículas</h1>
          <p>Consulta tus cursos y matricúlate en los cursos disponibles.</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            className="usuarios-boton-secundario"
            onClick={cargar}
            disabled={cargando}
          >
            <RefreshCw size={18} />
            Actualizar
          </button>

          <button
            type="button"
            className="usuarios-boton-principal"
            onClick={abrirModal}
            disabled={cargando || Boolean(error)}
          >
            <Plus size={18} />
            Matricularme
          </button>
        </div>
      </div>

      <div className="usuarios-resumen">
        <div>
          <ClipboardList size={23} />
          <span>Total</span>
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
        {mensaje && (
          <p className="usuarios-exito" role="status">
            {mensaje}
          </p>
        )}

        {error && (
          <p className="usuarios-error" role="alert">
            {error}
          </p>
        )}

        {cargando ? (
          <p className="usuarios-vacio">Cargando tus matrículas...</p>
        ) : !error && matriculas.length === 0 ? (
          <p className="usuarios-vacio">Todavía no tienes matrículas registradas.</p>
        ) : !error ? (
          <div className="usuarios-tabla-contenedor">
            <table className="usuarios-tabla">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Periodo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {matriculas.map((matricula) => (
                  <tr key={matricula.id}>
                    <td>{nombreCurso(matricula.cursoId)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {modalAbierto && (
        <div className="usuarios-modal-fondo">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Matricularme"
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={cerrarModal}
              disabled={guardando}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <form onSubmit={confirmarMatricula} className="usuarios-formulario">
              <h3>Matricularme</h3>

              <label htmlFor="mi-curso">Curso (activos con cupo)</label>
              <SelectorBuscable
                id="mi-curso"
                opciones={opcionesCursos}
                valor={cursoElegido}
                onChange={setCursoElegido}
                placeholder="Buscar curso por código o nombre..."
                vacio="No hay cursos disponibles para ti en este momento"
                deshabilitado={guardando}
              />

              {errorModal && (
                <p className="usuarios-error" role="alert">
                  {errorModal}
                </p>
              )}

              <div className="usuarios-formulario-acciones">
                <button type="button" onClick={cerrarModal} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}>
                  {guardando ? "Matriculando..." : "Confirmar matrícula"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
