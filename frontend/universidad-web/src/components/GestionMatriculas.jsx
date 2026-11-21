import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  RefreshCw,
  ClipboardList,
  CircleCheck,
  CircleX,
  Ban,
  X,
} from "lucide-react";

import {
  obtenerEstudiantes,
  obtenerCursos,
  obtenerMatriculasPorEstudiante,
  registrarMatricula,
  anularMatricula,
} from "../services/api";

import SelectorBuscable from "./SelectorBuscable";
import "./GestionUsuarios.css";

const FORMULARIO_VACIO = { estudianteId: "", cursoId: "", periodo: "2026-II" };

export default function GestionMatriculas({ token }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [estudianteId, setEstudianteId] = useState("");
  const [estudianteBuscado, setEstudianteBuscado] = useState(null);
  const [matriculas, setMatriculas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

  useEffect(() => {
    let activo = true;

    async function cargarDatosIniciales() {
      try {
        const [datosEstudiantes, datosCursos] = await Promise.all([
          obtenerEstudiantes(token),
          obtenerCursos(token),
        ]);
        if (activo) {
          setEstudiantes(
            Array.isArray(datosEstudiantes) ? datosEstudiantes : []
          );
          setCursos(Array.isArray(datosCursos) ? datosCursos : []);
        }
      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      }
    }

    cargarDatosIniciales();

    return () => {
      activo = false;
    };
  }, [token]);

  const opcionesEstudiantesActivos = useMemo(() => {
    return estudiantes
      .filter((e) => e.activo === true)
      .map((e) => ({
        valor: String(e.id),
        titulo: `${e.nombres} ${e.apellidos}`,
        detalle: `ID ${e.id} · ${e.codigo} · DNI ${e.dni} · ${e.carrera}`,
      }));
  }, [estudiantes]);

  const opcionesTodosEstudiantes = useMemo(() => {
    return estudiantes.map((e) => ({
      valor: String(e.id),
      titulo: `${e.nombres} ${e.apellidos}`,
      detalle: `ID ${e.id} · ${e.codigo} · DNI ${e.dni} · ${e.carrera}${
        e.activo === false ? " · INACTIVO" : ""
      }`,
    }));
  }, [estudiantes]);

  const opcionesCursosDisponibles = useMemo(() => {
    return cursos
      .filter(
        (c) =>
          c.activo === true &&
          c.estado === "ACTIVO" &&
          c.cuposDisponibles > 0
      )
      .map((c) => ({
        valor: String(c.id),
        titulo: `${c.codigo} - ${c.nombre}`,
        detalle: `ID ${c.id} · Ciclo ${c.ciclo} · ${c.cuposDisponibles}/${c.cuposTotales} cupos`,
      }));
  }, [cursos]);

  function obtenerNombreCurso(cursoId) {
    const curso = cursos.find((c) => String(c.id) === String(cursoId));
    return curso ? `${curso.codigo} - ${curso.nombre}` : cursoId;
  }

  const consultaVigente = useRef(null);

  async function cargarMatriculas(id) {
    if (!id) {
      setError("Selecciona un estudiante.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      consultaVigente.current = id;
      const datos = await obtenerMatriculasPorEstudiante(token, id);
      if (consultaVigente.current !== id) return; // llegó la respuesta de un estudiante anterior
      setMatriculas(Array.isArray(datos) ? datos : []);
      setEstudianteBuscado(id);
    } catch (err) {
      setError(err.message);
      setMatriculas([]);
    } finally {
      setCargando(false);
    }
  }

  function abrirModal() {
    setFormulario({
      ...FORMULARIO_VACIO,
      estudianteId: estudianteBuscado ? String(estudianteBuscado) : "",
    });
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

    if (!formulario.estudianteId || !formulario.cursoId) {
      setError("Selecciona el estudiante y el curso.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const datos = {
        estudianteId: Number(formulario.estudianteId),
        cursoId: Number(formulario.cursoId),
        periodo: formulario.periodo.trim(),
      };

      await registrarMatricula(token, datos);
      obtenerCursos(token).then(setCursos).catch(() => {}); // refresca cupos

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
      obtenerCursos(token).then(setCursos).catch(() => {}); // refresca cupos
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
        <div className="usuarios-herramientas">
          <div style={{ flex: 1, maxWidth: "460px" }}>
            <SelectorBuscable
              id="consulta-estudiante"
              opciones={opcionesTodosEstudiantes}
              valor={estudianteId}
              onChange={(nuevoId) => {
                setEstudianteId(nuevoId);
                if (nuevoId) {
                  cargarMatriculas(nuevoId);
                } else {
                  setMatriculas([]);
                  setEstudianteBuscado(null);
                }
              }}
              placeholder="Buscar estudiante por nombre, código o DNI..."
              vacio="No se encontraron estudiantes"
              deshabilitado={cargando}
            />
          </div>

          <button
            type="button"
            className="usuarios-boton-secundario"
            onClick={() => cargarMatriculas(estudianteBuscado)}
            disabled={cargando || !estudianteBuscado}
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        </div>

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
            Selecciona un estudiante para ver sus matrículas.
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
                    <td>{obtenerNombreCurso(matricula.cursoId)}</td>
                    <td>{matricula.periodo}</td>
                    <td>
                      {new Date(matricula.fechaMatricula).toLocaleString(
                        "es-PE"
                      )}
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

              <label htmlFor="matricula-estudiante">Estudiante</label>
              <SelectorBuscable
                id="matricula-estudiante"
                opciones={opcionesEstudiantesActivos}
                valor={formulario.estudianteId}
                onChange={(nuevoId) =>
                  setFormulario((anterior) => ({
                    ...anterior,
                    estudianteId: nuevoId,
                  }))
                }
                placeholder="Seleccionar estudiante activo..."
                vacio="No se encontraron estudiantes activos"
                deshabilitado={guardando}
              />

              <label htmlFor="matricula-curso">Curso (activos con cupo)</label>
              <SelectorBuscable
                id="matricula-curso"
                opciones={opcionesCursosDisponibles}
                valor={formulario.cursoId}
                onChange={(nuevoId) =>
                  setFormulario((anterior) => ({
                    ...anterior,
                    cursoId: nuevoId,
                  }))
                }
                placeholder="Seleccionar curso activo..."
                vacio="No se encontraron cursos activos con cupos disponibles"
                deshabilitado={guardando}
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
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
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
