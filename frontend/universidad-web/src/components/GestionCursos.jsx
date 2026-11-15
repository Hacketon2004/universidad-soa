import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  BookOpen,
  CircleCheck,
  CircleX,
  Ban,
  X,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  Users,
  GraduationCap,
} from "lucide-react";

import {
  obtenerCursos,
  obtenerCurso,
  obtenerCursosPorCiclo,
  obtenerCursosPorDocente,
  consultarCursosDisponibles,
  crearCurso,
  editarCurso,
  asignarDocenteCurso,
  cancelarCurso,
  darDeBajaCurso,
} from "../services/api";

import "./GestionUsuarios.css";

const FORMULARIO_CURSO_INICIAL = {
  codigo: "",
  nombre: "",
  creditos: 1,
  ciclo: 1,
  cuposTotales: 30,
  prerrequisitosIds: [],
};

const FORMULARIO_DOCENTE_INICIAL = {
  docenteId: "",
  docenteNombre: "",
  docenteCorreo: "",
};

const FORMULARIO_CANCELAR_INICIAL = {
  motivo: "",
  canceladoPor: "ADMINISTRADOR",
};

export default function GestionCursos({ token, rol }) {
  const esAdmin = rol === "ADMINISTRADOR";

  const [cursos, setCursos] = useState([]);
  const [todosLosCursos, setTodosLosCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [cicloFiltro, setCicloFiltro] = useState("");
  const [docenteIdFiltro, setDocenteIdFiltro] = useState("");

  // Modales
  // 1. Ver Detalle
  const [modalDetalle, setModalDetalle] = useState(false);
  const [detalleCurso, setDetalleCurso] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // 2. Crear / Editar
  const [modalCurso, setModalCurso] = useState(false);
  const [cursoEditando, setCursoEditando] = useState(null);
  const [formCurso, setFormCurso] = useState(FORMULARIO_CURSO_INICIAL);
  const [errorModalCurso, setErrorModalCurso] = useState("");

  // 3. Asignar Docente
  const [modalDocente, setModalDocente] = useState(false);
  const [cursoDocente, setCursoDocente] = useState(null);
  const [formDocente, setFormDocente] = useState(FORMULARIO_DOCENTE_INICIAL);
  const [errorModalDocente, setErrorModalDocente] = useState("");

  // 4. Cancelar Curso
  const [modalCancelar, setModalCancelar] = useState(false);
  const [cursoCancelar, setCursoCancelar] = useState(null);
  const [formCancelar, setFormCancelar] = useState(FORMULARIO_CANCELAR_INICIAL);
  const [errorModalCancelar, setErrorModalCancelar] = useState("");

  // 5. Dar de Baja (Confirmación)
  const [modalBaja, setModalBaja] = useState(false);
  const [cursoBaja, setCursoBaja] = useState(null);
  const [errorModalBaja, setErrorModalBaja] = useState("");

  // 6. Consultar Disponibilidad
  const [modalDisponibilidad, setModalDisponibilidad] = useState(false);
  const [cicloEstudiante, setCicloEstudiante] = useState(1);
  const [cursosAprobadosIds, setCursosAprobadosIds] = useState([]);
  const [resultadoDisponibilidad, setResultadoDisponibilidad] = useState(null);
  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false);
  const [errorDisponibilidad, setErrorDisponibilidad] = useState("");

  async function cargarCursos() {
    setCargando(true);
    setError("");
    try {
      const datos = await obtenerCursos(token);
      const lista = Array.isArray(datos) ? datos : [];
      setCursos(lista);
      setTodosLosCursos(lista);
    } catch (err) {
      setError(err.message || "Error al cargar los cursos.");
      setCursos([]);
      setTodosLosCursos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCursos();
  }, [token]);

  async function recargarLista() {
    try {
      const [todos, filtrados] = await Promise.all([
        obtenerCursos(token),
        cicloFiltro
          ? obtenerCursosPorCiclo(token, cicloFiltro)
          : docenteIdFiltro.trim()
          ? obtenerCursosPorDocente(token, docenteIdFiltro.trim())
          : obtenerCursos(token),
      ]);
      setTodosLosCursos(Array.isArray(todos) ? todos : []);
      setCursos(Array.isArray(filtrados) ? filtrados : []);
    } catch (err) {
      setError(err.message || "Error al actualizar la lista.");
    }
  }

  async function manejarCambioCiclo(nuevoCiclo) {
    setCicloFiltro(nuevoCiclo);
    setDocenteIdFiltro("");
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      if (!nuevoCiclo) {
        const datos = await obtenerCursos(token);
        setCursos(Array.isArray(datos) ? datos : []);
      } else {
        const datos = await obtenerCursosPorCiclo(token, nuevoCiclo);
        setCursos(Array.isArray(datos) ? datos : []);
      }
    } catch (err) {
      setError(err.message || "Error al filtrar por ciclo.");
      setCursos([]);
    } finally {
      setCargando(false);
    }
  }

  async function manejarBuscarDocente(e) {
    if (e) e.preventDefault();
    if (!docenteIdFiltro.trim()) {
      setError("Ingresa el ID del docente a buscar.");
      return;
    }
    setCicloFiltro("");
    setCargando(true);
    setError("");
    setMensaje("");
    try {
      const datos = await obtenerCursosPorDocente(token, docenteIdFiltro.trim());
      setCursos(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err.message || "Error al buscar por docente.");
      setCursos([]);
    } finally {
      setCargando(false);
    }
  }

  async function manejarActualizar() {
    setBusqueda("");
    setCicloFiltro("");
    setDocenteIdFiltro("");
    setMensaje("");
    await cargarCursos();
  }

  const cursosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return cursos;
    return cursos.filter(
      (c) =>
        (c.codigo && c.codigo.toLowerCase().includes(q)) ||
        (c.nombre && c.nombre.toLowerCase().includes(q))
    );
  }, [cursos, busqueda]);

  const totalCursos = cursos.length;
  const totalActivos = cursos.filter((c) => c.estado === "ACTIVO").length;
  const totalCuposAgotados = cursos.filter(
    (c) => c.estado === "CUPOS_AGOTADOS"
  ).length;
  const totalCancelados = cursos.filter((c) => c.estado === "CANCELADO").length;

  // Acciones: Detalle
  async function abrirVerDetalle(id) {
    setModalDetalle(true);
    setDetalleCurso(null);
    setCargandoDetalle(true);
    setError("");
    try {
      const datos = await obtenerCurso(token, id);
      setDetalleCurso(datos);
    } catch (err) {
      setError(err.message || "Error al obtener el detalle del curso.");
      setModalDetalle(false);
    } finally {
      setCargandoDetalle(false);
    }
  }

  // Acciones: Crear / Editar
  function abrirNuevoCurso() {
    setCursoEditando(null);
    setFormCurso(FORMULARIO_CURSO_INICIAL);
    setErrorModalCurso("");
    setError("");
    setMensaje("");
    setModalCurso(true);
  }

  async function abrirEditarCurso(curso) {
    setCursoEditando(curso);
    setErrorModalCurso("");
    setError("");
    setMensaje("");
    setGuardando(true);
    try {
      const detalle = await obtenerCurso(token, curso.id);
      setCursoEditando(detalle);
      setFormCurso({
        codigo: detalle.codigo || "",
        nombre: detalle.nombre || "",
        creditos: detalle.creditos ?? 1,
        ciclo: detalle.ciclo ?? 1,
        cuposTotales: detalle.cuposTotales ?? 30,
        prerrequisitosIds: detalle.prerrequisitos
          ? detalle.prerrequisitos.map((p) => p.id)
          : [],
      });
      setModalCurso(true);
    } catch (err) {
      setError(err.message || "Error al cargar datos del curso.");
    } finally {
      setGuardando(false);
    }
  }

  function alternarPrerrequisito(id) {
    setFormCurso((prev) => {
      const existe = prev.prerrequisitosIds.includes(id);
      return {
        ...prev,
        prerrequisitosIds: existe
          ? prev.prerrequisitosIds.filter((pId) => pId !== id)
          : [...prev.prerrequisitosIds, id],
      };
    });
  }

  async function guardarCurso(e) {
    e.preventDefault();
    setErrorModalCurso("");

    const codigo = formCurso.codigo.trim();
    if (!codigo) {
      setErrorModalCurso("El código del curso es obligatorio.");
      return;
    }

    const nombre = formCurso.nombre.trim();
    if (!nombre) {
      setErrorModalCurso("El nombre del curso es obligatorio.");
      return;
    }

    const creditos = Number(formCurso.creditos);
    if (!Number.isInteger(creditos) || creditos < 1) {
      setErrorModalCurso(
        "Los créditos deben ser un número entero mayor o igual a 1."
      );
      return;
    }

    const ciclo = Number(formCurso.ciclo);
    if (!Number.isInteger(ciclo) || ciclo < 1 || ciclo > 10) {
      setErrorModalCurso("El ciclo debe ser un número entero entre 1 y 10.");
      return;
    }

    const cuposTotales = Number(formCurso.cuposTotales);
    if (!Number.isInteger(cuposTotales) || cuposTotales < 0) {
      setErrorModalCurso(
        "Los cupos totales deben ser un número entero mayor o igual a 0."
      );
      return;
    }

    const payload = {
      codigo,
      nombre,
      creditos,
      ciclo,
      cuposTotales,
      prerrequisitosIds: formCurso.prerrequisitosIds.map(Number),
    };

    setGuardando(true);
    try {
      if (cursoEditando) {
        await editarCurso(token, cursoEditando.id, payload);
        setMensaje("Curso actualizado correctamente.");
      } else {
        await crearCurso(token, payload);
        setMensaje("Curso creado correctamente.");
      }
      setModalCurso(false);
      await recargarLista();
    } catch (err) {
      setErrorModalCurso(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Acciones: Asignar Docente
  function abrirAsignarDocente(curso) {
    setCursoDocente(curso);
    setFormDocente({
      docenteId: curso.docenteId ? String(curso.docenteId) : "",
      docenteNombre:
        curso.docenteNombre && curso.docenteNombre !== "Por asignar"
          ? curso.docenteNombre
          : "",
      docenteCorreo: curso.docenteCorreo || "",
    });
    setErrorModalDocente("");
    setError("");
    setMensaje("");
    setModalDocente(true);
  }

  async function guardarDocente(e) {
    e.preventDefault();
    setErrorModalDocente("");

    const docenteId = Number(formDocente.docenteId);
    if (!docenteId || docenteId < 1) {
      setErrorModalDocente("El ID del docente debe ser un número entero positivo.");
      return;
    }

    const docenteNombre = formDocente.docenteNombre.trim();
    if (!docenteNombre) {
      setErrorModalDocente("El nombre del docente es obligatorio.");
      return;
    }

    const payload = {
      docenteId,
      docenteNombre,
      ...(formDocente.docenteCorreo.trim()
        ? { docenteCorreo: formDocente.docenteCorreo.trim() }
        : {}),
    };

    setGuardando(true);
    try {
      await asignarDocenteCurso(token, cursoDocente.id, payload);
      setMensaje("Docente asignado correctamente.");
      setModalDocente(false);
      await recargarLista();
    } catch (err) {
      setErrorModalDocente(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Acciones: Cancelar
  function abrirCancelarCurso(curso) {
    setCursoCancelar(curso);
    setFormCancelar({
      motivo: "",
      canceladoPor: "ADMINISTRADOR",
    });
    setErrorModalCancelar("");
    setError("");
    setMensaje("");
    setModalCancelar(true);
  }

  async function guardarCancelarCurso(e) {
    e.preventDefault();
    setErrorModalCancelar("");

    const motivo = formCancelar.motivo.trim();
    if (motivo.length < 10 || motivo.length > 500) {
      setErrorModalCancelar("El motivo debe tener entre 10 y 500 caracteres.");
      return;
    }

    const canceladoPor = formCancelar.canceladoPor.trim();
    if (!canceladoPor) {
      setErrorModalCancelar("El campo 'Cancelado por' es obligatorio.");
      return;
    }

    setGuardando(true);
    try {
      const resp = await cancelarCurso(token, cursoCancelar.id, {
        motivo,
        canceladoPor,
      });
      setMensaje(
        resp.mensajeParaEstudiantes ||
          `Curso ${cursoCancelar.codigo} cancelado correctamente.`
      );
      setModalCancelar(false);
      await recargarLista();
    } catch (err) {
      setErrorModalCancelar(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Acciones: Dar de baja
  function abrirBajaCurso(curso) {
    setCursoBaja(curso);
    setErrorModalBaja("");
    setError("");
    setMensaje("");
    setModalBaja(true);
  }

  async function confirmarDarDeBaja() {
    if (!cursoBaja) return;
    setErrorModalBaja("");
    setGuardando(true);
    try {
      await darDeBajaCurso(token, cursoBaja.id);
      setMensaje(`Curso ${cursoBaja.codigo} dado de baja correctamente.`);
      setModalBaja(false);
      await recargarLista();
    } catch (err) {
      setErrorModalBaja(err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Acciones: Disponibilidad
  function abrirModalDisponibilidad() {
    setModalDisponibilidad(true);
    setCicloEstudiante(1);
    setCursosAprobadosIds([]);
    setResultadoDisponibilidad(null);
    setErrorDisponibilidad("");
  }

  function alternarCursoAprobado(id) {
    setCursosAprobadosIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function ejecutarConsultaDisponibilidad(e) {
    if (e) e.preventDefault();
    setErrorDisponibilidad("");

    const ciclo = Number(cicloEstudiante);
    if (!Number.isInteger(ciclo) || ciclo < 1 || ciclo > 10) {
      setErrorDisponibilidad("El ciclo del estudiante debe estar entre 1 y 10.");
      return;
    }

    setCargandoDisponibilidad(true);
    try {
      const datos = await consultarCursosDisponibles(token, {
        cicloEstudiante: ciclo,
        cursosAprobadosIds: cursosAprobadosIds.map(Number),
      });
      setResultadoDisponibilidad(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setErrorDisponibilidad(err.message);
      setResultadoDisponibilidad(null);
    } finally {
      setCargandoDisponibilidad(false);
    }
  }

  function renderEstado(estado) {
    switch (estado) {
      case "ACTIVO":
        return <span className="usuarios-estado activo">Activo</span>;
      case "CUPOS_AGOTADOS":
        return (
          <span
            className="usuarios-estado"
            style={{ background: "#4a3b1a", color: "#ffd56b" }}
          >
            Cupos agotados
          </span>
        );
      case "CANCELADO":
        return <span className="usuarios-estado inactivo">Cancelado</span>;
      case "CERRADO":
        return (
          <span
            className="usuarios-estado"
            style={{ background: "#2d3748", color: "#cbd5e0" }}
          >
            Cerrado
          </span>
        );
      default:
        return <span className="usuarios-estado">{estado}</span>;
    }
  }

  return (
    <section className="gestion-usuarios">
      <div className="usuarios-cabecera">
        <div>
          <span className="usuarios-etiqueta">ACADÉMICO</span>
          <h1>Gestión de Cursos</h1>
          <p>Oferta académica, cupos, docentes y prerrequisitos.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="usuarios-boton-secundario"
            onClick={abrirModalDisponibilidad}
          >
            <GraduationCap size={18} />
            Consultar disponibilidad
          </button>

          {esAdmin && (
            <button
              type="button"
              className="usuarios-boton-principal"
              onClick={abrirNuevoCurso}
            >
              <Plus size={18} />
              Nuevo curso
            </button>
          )}
        </div>
      </div>

      <div
        className="usuarios-resumen"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <div>
          <BookOpen size={23} />
          <span>Total de cursos</span>
          <strong>{totalCursos}</strong>
        </div>
        <div>
          <CircleCheck size={23} />
          <span>Activos</span>
          <strong>{totalActivos}</strong>
        </div>
        <div>
          <Users size={23} />
          <span>Cupos agotados</span>
          <strong>{totalCuposAgotados}</strong>
        </div>
        <div>
          <CircleX size={23} />
          <span>Cancelados</span>
          <strong>{totalCancelados}</strong>
        </div>
      </div>

      <div className="usuarios-panel">
        <div className="usuarios-herramientas" style={{ flexWrap: "wrap" }}>
          <div className="usuarios-busqueda">
            <Search size={19} />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <select
              value={cicloFiltro}
              onChange={(e) => manejarCambioCiclo(e.target.value)}
              disabled={cargando}
              style={{
                background: "#0c1a30",
                color: "white",
                border: "1px solid #385373",
                borderRadius: "10px",
                padding: "10px 14px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Ciclo: Todos</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                <option key={c} value={c}>
                  Ciclo {c}
                </option>
              ))}
            </select>

            <form
              onSubmit={manejarBuscarDocente}
              style={{ display: "flex", gap: "6px", alignItems: "center" }}
            >
              <input
                type="number"
                min="1"
                placeholder="ID docente"
                value={docenteIdFiltro}
                onChange={(e) => setDocenteIdFiltro(e.target.value)}
                style={{
                  width: "110px",
                  background: "#0c1a30",
                  color: "white",
                  border: "1px solid #385373",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                className="usuarios-boton-secundario"
                disabled={cargando}
              >
                <Search size={18} />
                Buscar
              </button>
            </form>

            <button
              type="button"
              className="usuarios-boton-secundario"
              onClick={manejarActualizar}
              disabled={cargando}
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>
        </div>

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
          <p className="usuarios-vacio">Cargando cursos...</p>
        ) : cursos.length === 0 ? (
          <p className="usuarios-vacio">No hay cursos registrados.</p>
        ) : cursosFiltrados.length === 0 ? (
          <p className="usuarios-vacio">
            No hay cursos que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="usuarios-tabla-contenedor">
            <table className="usuarios-tabla">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Ciclo</th>
                  <th>Créditos</th>
                  <th>Cupos</th>
                  <th>Docente</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursosFiltrados.map((curso) => (
                  <tr key={curso.id}>
                    <td>
                      <strong>{curso.codigo}</strong>
                    </td>
                    <td>{curso.nombre}</td>
                    <td>Ciclo {curso.ciclo}</td>
                    <td>{curso.creditos}</td>
                    <td>
                      <div>
                        <span>
                          {curso.cuposDisponibles} / {curso.cuposTotales}
                        </span>{" "}
                        <small style={{ color: "#aabbd4" }}>
                          ({curso.porcentajeOcupacion}%)
                        </small>
                        <div
                          style={{
                            background: "#203654",
                            borderRadius: "4px",
                            height: "6px",
                            width: "100%",
                            marginTop: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              background:
                                curso.alertaCupo === "AGOTADO" ||
                                curso.cuposDisponibles === 0
                                  ? "#ffad9d"
                                  : curso.alertaCupo === "ULTIMOS_CUPOS"
                                  ? "#ffd56b"
                                  : "#73e0af",
                              height: "100%",
                              width: `${Math.min(
                                curso.porcentajeOcupacion ?? 0,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{curso.docenteNombre || "Por asignar"}</td>
                    <td>{renderEstado(curso.estado)}</td>
                    <td>
                      <div className="usuarios-acciones">
                        <button
                          type="button"
                          title="Ver detalle"
                          onClick={() => abrirVerDetalle(curso.id)}
                        >
                          <Eye size={17} />
                        </button>

                        {esAdmin && curso.estado !== "CANCELADO" && (
                          <>
                            <button
                              type="button"
                              title="Editar curso"
                              onClick={() => abrirEditarCurso(curso)}
                              disabled={guardando}
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              type="button"
                              title="Asignar docente"
                              onClick={() => abrirAsignarDocente(curso)}
                              disabled={guardando}
                            >
                              <UserCheck size={17} />
                            </button>
                            <button
                              type="button"
                              title="Cancelar curso"
                              onClick={() => abrirCancelarCurso(curso)}
                              disabled={guardando}
                            >
                              <Ban size={17} />
                            </button>
                            <button
                              type="button"
                              title="Dar de baja curso"
                              onClick={() => abrirBajaCurso(curso)}
                              disabled={guardando}
                            >
                              <Trash2 size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Ver Detalle */}
      {modalDetalle && (
        <div className="usuarios-modal-fondo">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Detalle del curso"
            style={{ maxWidth: "560px" }}
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={() => setModalDetalle(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            {cargandoDetalle ? (
              <p className="usuarios-vacio">Cargando información del curso...</p>
            ) : !detalleCurso ? (
              <p className="usuarios-vacio">No se pudo cargar el detalle.</p>
            ) : (
              <div className="usuarios-formulario">
                <span className="usuarios-etiqueta">DETALLE ACADÉMICO</span>
                <h3 style={{ margin: "4px 0 12px" }}>
                  {detalleCurso.codigo} — {detalleCurso.nombre}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <span style={{ color: "#aabbd4", display: "block" }}>ID:</span>
                    <strong>{detalleCurso.id}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#aabbd4", display: "block" }}>Ciclo:</span>
                    <strong>Ciclo {detalleCurso.ciclo}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#aabbd4", display: "block" }}>Créditos:</span>
                    <strong>{detalleCurso.creditos}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#aabbd4", display: "block" }}>Estado:</span>
                    {renderEstado(detalleCurso.estado)}
                  </div>
                  <div>
                    <span style={{ color: "#aabbd4", display: "block" }}>Cupos totales:</span>
                    <strong>{detalleCurso.cuposTotales}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#aabbd4", display: "block" }}>Cupos disponibles:</span>
                    <strong>
                      {detalleCurso.cuposDisponibles} ({detalleCurso.porcentajeOcupacion}%)
                    </strong>
                  </div>
                </div>

                <div style={{ marginTop: "8px" }}>
                  <span style={{ color: "#aabbd4", display: "block" }}>Mensaje de cupo:</span>
                  <p style={{ margin: "4px 0", color: "#e8eef9" }}>
                    {detalleCurso.mensajeCupo || "Sin alertas de cupo."}
                  </p>
                </div>

                <div style={{ marginTop: "8px" }}>
                  <span style={{ color: "#aabbd4", display: "block" }}>Docente:</span>
                  <p style={{ margin: "4px 0", color: "#e8eef9" }}>
                    {detalleCurso.docenteNombre || "Por asignar"}
                    {detalleCurso.docenteId ? ` (ID: ${detalleCurso.docenteId})` : ""}
                    {detalleCurso.docenteCorreo ? ` — ${detalleCurso.docenteCorreo}` : ""}
                  </p>
                </div>

                <div style={{ marginTop: "8px" }}>
                  <span style={{ color: "#aabbd4", display: "block" }}>Prerrequisitos:</span>
                  {detalleCurso.prerrequisitos && detalleCurso.prerrequisitos.length > 0 ? (
                    <ul style={{ margin: "4px 0", paddingLeft: "20px", color: "#e8eef9" }}>
                      {detalleCurso.prerrequisitos.map((pre) => (
                        <li key={pre.id}>
                          <strong>{pre.codigo}</strong> – {pre.nombre} (Ciclo {pre.ciclo})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: "4px 0", color: "#aabbd4" }}>Ninguno</p>
                  )}
                </div>

                {(detalleCurso.estado === "CANCELADO" || detalleCurso.motivoCancelacion) && (
                  <div
                    style={{
                      marginTop: "12px",
                      background: "#2c1c1f",
                      border: "1px solid #732d34",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <span style={{ color: "#ffad9d", fontWeight: "bold", display: "block" }}>
                      Información de cancelación
                    </span>
                    <p style={{ margin: "4px 0", color: "#ffd5cb" }}>
                      <strong>Motivo:</strong> {detalleCurso.motivoCancelacion || "—"}
                    </p>
                    <p style={{ margin: "4px 0", color: "#ffd5cb" }}>
                      <strong>Fecha:</strong>{" "}
                      {detalleCurso.fechaCancelacion
                        ? new Date(detalleCurso.fechaCancelacion).toLocaleString("es-PE")
                        : "—"}
                    </p>
                  </div>
                )}

                <div className="usuarios-formulario-acciones">
                  <button type="button" onClick={() => setModalDetalle(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Crear / Editar Curso */}
      {modalCurso && (
        <div className="usuarios-modal-fondo">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label={cursoEditando ? "Editar curso" : "Nuevo curso"}
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={() => setModalCurso(false)}
              disabled={guardando}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <form onSubmit={guardarCurso} className="usuarios-formulario">
              <span className="usuarios-etiqueta">
                {cursoEditando ? "EDICIÓN" : "CREACIÓN"}
              </span>
              <h3>{cursoEditando ? "Editar curso" : "Nuevo curso"}</h3>

              <label htmlFor="curso-codigo">Código</label>
              <input
                id="curso-codigo"
                type="text"
                value={formCurso.codigo}
                onChange={(e) =>
                  setFormCurso((prev) => ({ ...prev, codigo: e.target.value }))
                }
                placeholder="Ej. MAT101"
                required
              />

              <label htmlFor="curso-nombre">Nombre</label>
              <input
                id="curso-nombre"
                type="text"
                value={formCurso.nombre}
                onChange={(e) =>
                  setFormCurso((prev) => ({ ...prev, nombre: e.target.value }))
                }
                placeholder="Ej. Cálculo I"
                required
              />

              <label htmlFor="curso-creditos">Créditos (≥ 1)</label>
              <input
                id="curso-creditos"
                type="number"
                min="1"
                value={formCurso.creditos}
                onChange={(e) =>
                  setFormCurso((prev) => ({ ...prev, creditos: e.target.value }))
                }
                required
              />

              <label htmlFor="curso-ciclo">Ciclo (1–10)</label>
              <select
                id="curso-ciclo"
                value={formCurso.ciclo}
                onChange={(e) =>
                  setFormCurso((prev) => ({
                    ...prev,
                    ciclo: Number(e.target.value),
                  }))
                }
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                  <option key={c} value={c}>
                    Ciclo {c}
                  </option>
                ))}
              </select>

              <label htmlFor="curso-cupos">Cupos totales (≥ 0)</label>
              <input
                id="curso-cupos"
                type="number"
                min="0"
                value={formCurso.cuposTotales}
                onChange={(e) =>
                  setFormCurso((prev) => ({
                    ...prev,
                    cuposTotales: e.target.value,
                  }))
                }
                required
              />

              <label>Prerrequisitos</label>
              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  border: "1px solid #395577",
                  borderRadius: "8px",
                  padding: "10px",
                  background: "#0c1a30",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {todosLosCursos.filter(
                  (c) => !cursoEditando || c.id !== cursoEditando.id
                ).length === 0 ? (
                  <small style={{ color: "#aabbd4" }}>
                    No hay otros cursos disponibles para seleccionar como prerrequisito.
                  </small>
                ) : (
                  todosLosCursos
                    .filter((c) => !cursoEditando || c.id !== cursoEditando.id)
                    .map((c) => (
                      <label
                        key={c.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "normal",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formCurso.prerrequisitosIds.includes(c.id)}
                          onChange={() => alternarPrerrequisito(c.id)}
                          style={{ width: "auto" }}
                        />
                        <span>
                          <strong>{c.codigo}</strong> — {c.nombre} (Ciclo {c.ciclo})
                        </span>
                      </label>
                    ))
                )}
              </div>

              {errorModalCurso && (
                <p className="usuarios-error" role="alert">
                  {errorModalCurso}
                </p>
              )}

              <div className="usuarios-formulario-acciones">
                <button
                  type="button"
                  onClick={() => setModalCurso(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}>
                  {guardando
                    ? "Guardando..."
                    : cursoEditando
                    ? "Guardar cambios"
                    : "Crear curso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Asignar Docente */}
      {modalDocente && (
        <div className="usuarios-modal-fondo">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Asignar docente"
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={() => setModalDocente(false)}
              disabled={guardando}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <form onSubmit={guardarDocente} className="usuarios-formulario">
              <span className="usuarios-etiqueta">DOCENTE</span>
              <h3>Asignar docente a {cursoDocente?.codigo}</h3>

              <label htmlFor="docente-id">ID del docente</label>
              <input
                id="docente-id"
                type="number"
                min="1"
                value={formDocente.docenteId}
                onChange={(e) =>
                  setFormDocente((prev) => ({
                    ...prev,
                    docenteId: e.target.value,
                  }))
                }
                placeholder="Ej. 10"
                required
              />

              <label htmlFor="docente-nombre">Nombre del docente</label>
              <input
                id="docente-nombre"
                type="text"
                value={formDocente.docenteNombre}
                onChange={(e) =>
                  setFormDocente((prev) => ({
                    ...prev,
                    docenteNombre: e.target.value,
                  }))
                }
                placeholder="Ej. Mg. Juan Pérez"
                required
              />

              <label htmlFor="docente-correo">Correo electrónico (opcional)</label>
              <input
                id="docente-correo"
                type="email"
                value={formDocente.docenteCorreo}
                onChange={(e) =>
                  setFormDocente((prev) => ({
                    ...prev,
                    docenteCorreo: e.target.value,
                  }))
                }
                placeholder="docente@universidad.edu.pe"
              />

              {errorModalDocente && (
                <p className="usuarios-error" role="alert">
                  {errorModalDocente}
                </p>
              )}

              <div className="usuarios-formulario-acciones">
                <button
                  type="button"
                  onClick={() => setModalDocente(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}>
                  {guardando ? "Asignando..." : "Asignar docente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Cancelar Curso */}
      {modalCancelar && (
        <div className="usuarios-modal-fondo">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Cancelar curso"
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={() => setModalCancelar(false)}
              disabled={guardando}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <form onSubmit={guardarCancelarCurso} className="usuarios-formulario">
              <span className="usuarios-etiqueta">CANCELACIÓN</span>
              <h3>Cancelar curso {cursoCancelar?.codigo}</h3>
              <p>
                Esta acción cancelará la oferta del curso y notificará a los estudiantes inscritos.
              </p>

              <label htmlFor="cancelar-por">Cancelado por</label>
              <input
                id="cancelar-por"
                type="text"
                value={formCancelar.canceladoPor}
                onChange={(e) =>
                  setFormCancelar((prev) => ({
                    ...prev,
                    canceladoPor: e.target.value,
                  }))
                }
                required
              />

              <label htmlFor="cancelar-motivo">
                Motivo de cancelación (10–500 caracteres)
              </label>
              <textarea
                id="cancelar-motivo"
                rows={4}
                value={formCancelar.motivo}
                onChange={(e) =>
                  setFormCancelar((prev) => ({
                    ...prev,
                    motivo: e.target.value,
                  }))
                }
                placeholder="Describe la razón por la que se cancela este curso..."
                minLength={10}
                maxLength={500}
                required
                style={{
                  width: "100%",
                  background: "#0c1a30",
                  color: "white",
                  border: "1px solid #395577",
                  borderRadius: "9px",
                  padding: "12px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <small
                style={{
                  color:
                    formCancelar.motivo.length < 10 ||
                    formCancelar.motivo.length > 500
                      ? "#ff9f9f"
                      : "#aabbd4",
                }}
              >
                {formCancelar.motivo.length} / 500 caracteres (mínimo 10)
              </small>

              {errorModalCancelar && (
                <p className="usuarios-error" role="alert">
                  {errorModalCancelar}
                </p>
              )}

              <div className="usuarios-formulario-acciones">
                <button
                  type="button"
                  onClick={() => setModalCancelar(false)}
                  disabled={guardando}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={{ background: "#d9534f" }}
                >
                  {guardando ? "Cancelando..." : "Confirmar cancelación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Dar de Baja (Confirmación) */}
      {modalBaja && (
        <div className="usuarios-modal-fondo">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Dar de baja curso"
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={() => setModalBaja(false)}
              disabled={guardando}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="usuarios-formulario">
              <span className="usuarios-etiqueta">CONFIRMACIÓN</span>
              <h3>Dar de baja curso</h3>
              <p>
                ¿Deseas dar de baja el curso{" "}
                <strong>
                  {cursoBaja?.codigo} — {cursoBaja?.nombre}
                </strong>
                ?
              </p>
              <p style={{ color: "#ffad9d", fontSize: "13px" }}>
                El curso quedará cancelado ("Baja administrativa del curso") y dejará de aparecer en la oferta académica.
              </p>

              {errorModalBaja && (
                <p className="usuarios-error" role="alert">
                  {errorModalBaja}
                </p>
              )}

              <div className="usuarios-formulario-acciones">
                <button
                  type="button"
                  onClick={() => setModalBaja(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarDarDeBaja}
                  disabled={guardando}
                  style={{ background: "#c53030" }}
                >
                  {guardando ? "Eliminando..." : "Confirmar baja"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Consultar Disponibilidad */}
      {modalDisponibilidad && (
        <div className="usuarios-modal-fondo">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Consultar disponibilidad"
            style={{ maxWidth: "800px" }}
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={() => setModalDisponibilidad(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="usuarios-formulario">
              <span className="usuarios-etiqueta">SIMULADOR ACADÉMICO</span>
              <h3>Consultar disponibilidad de cursos</h3>
              <p>
                Evalúa qué asignaturas están habilitadas según el ciclo actual del estudiante y sus cursos aprobados.
              </p>

              <form onSubmit={ejecutarConsultaDisponibilidad}>
                <label htmlFor="disp-ciclo">Ciclo del estudiante (1–10)</label>
                <select
                  id="disp-ciclo"
                  value={cicloEstudiante}
                  onChange={(e) => setCicloEstudiante(Number(e.target.value))}
                  style={{ marginBottom: "12px" }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={c}>
                      Ciclo {c}
                    </option>
                  ))}
                </select>

                <label>Cursos aprobados previamente</label>
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid #395577",
                    borderRadius: "8px",
                    padding: "10px",
                    background: "#0c1a30",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  {todosLosCursos.length === 0 ? (
                    <small style={{ color: "#aabbd4" }}>
                      No hay cursos disponibles para seleccionar.
                    </small>
                  ) : (
                    todosLosCursos.map((c) => (
                      <label
                        key={c.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "normal",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={cursosAprobadosIds.includes(c.id)}
                          onChange={() => alternarCursoAprobado(c.id)}
                          style={{ width: "auto" }}
                        />
                        <span>
                          <strong>{c.codigo}</strong> — {c.nombre} (Ciclo {c.ciclo})
                        </span>
                      </label>
                    ))
                  )}
                </div>

                {errorDisponibilidad && (
                  <p className="usuarios-error" role="alert">
                    {errorDisponibilidad}
                  </p>
                )}

                <div
                  className="usuarios-formulario-acciones"
                  style={{ marginTop: "4px" }}
                >
                  <button type="submit" disabled={cargandoDisponibilidad}>
                    {cargandoDisponibilidad
                      ? "Consultando..."
                      : "Consultar disponibilidad"}
                  </button>
                </div>
              </form>

              {resultadoDisponibilidad && (
                <div style={{ marginTop: "16px" }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: "16px" }}>
                    Cursos evaluados ({resultadoDisponibilidad.length})
                  </h4>

                  {resultadoDisponibilidad.length === 0 ? (
                    <p className="usuarios-vacio">No hay cursos evaluados.</p>
                  ) : (
                    <div className="usuarios-tabla-contenedor">
                      <table className="usuarios-tabla">
                        <thead>
                          <tr>
                            <th>Curso</th>
                            <th>Ciclo</th>
                            <th>Habilitado</th>
                            <th>Adelanto</th>
                            <th>Con cupo</th>
                            <th>Faltan prerrequisitos</th>
                            <th>Observación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultadoDisponibilidad.map((item, idx) => (
                            <tr key={item.curso?.id || idx}>
                              <td>
                                <strong>{item.curso?.codigo}</strong> —{" "}
                                {item.curso?.nombre}
                              </td>
                              <td>Ciclo {item.curso?.ciclo}</td>
                              <td>
                                <span
                                  className={
                                    item.habilitado
                                      ? "usuarios-estado activo"
                                      : "usuarios-estado inactivo"
                                  }
                                >
                                  {item.habilitado ? "Sí" : "No"}
                                </span>
                              </td>
                              <td>{item.esAdelanto ? "Sí" : "No"}</td>
                              <td>{item.tieneCupo ? "Sí" : "No"}</td>
                              <td>
                                {item.prerrequisitosFaltantes &&
                                item.prerrequisitosFaltantes.length > 0
                                  ? item.prerrequisitosFaltantes.join(", ")
                                  : "Ninguno"}
                              </td>
                              <td>{item.observacion || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="usuarios-formulario-acciones">
                <button
                  type="button"
                  onClick={() => setModalDisponibilidad(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
