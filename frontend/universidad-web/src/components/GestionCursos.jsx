import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
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
  Eraser,
  Tag,
  Award,
  Layers,
  Mail,
  FileText,
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
import "./GestionCursos.css";

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
        return (
          <span className="cursos-pill pill-activo">
            <span className="pill-punto">•</span> Activo
          </span>
        );
      case "CUPOS_AGOTADOS":
        return <span className="cursos-pill pill-ambar">Cupos agotados</span>;
      case "CANCELADO":
        return <span className="cursos-pill pill-cancelado">Cancelado</span>;
      case "CERRADO":
        return <span className="cursos-pill pill-gris">Cerrado</span>;
      default:
        return <span className="cursos-pill pill-gris">{estado}</span>;
    }
  }

  return (
    <section className="gestion-usuarios gestion-cursos">
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

      {/* Panel de Filtros */}
      <div className="cursos-filtros-panel">
        <div className="cursos-filtros-grid">
          <div className="cursos-filtro-item">
            <label className="cursos-filtro-etiqueta" htmlFor="filtro-busqueda">
              <Search size={14} /> BÚSQUEDA
            </label>
            <input
              id="filtro-busqueda"
              type="text"
              className="cursos-campo"
              placeholder="BUSCAR POR CÓDIGO O NOMBRE..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="cursos-filtro-item">
            <label className="cursos-filtro-etiqueta" htmlFor="filtro-ciclo">
              <Layers size={14} /> CICLO
            </label>
            <select
              id="filtro-ciclo"
              className="cursos-campo"
              value={cicloFiltro}
              onChange={(e) => manejarCambioCiclo(e.target.value)}
              disabled={cargando}
            >
              <option value="">TODOS LOS CICLOS</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                <option key={c} value={c}>
                  CICLO {c}
                </option>
              ))}
            </select>
          </div>

          <div className="cursos-filtro-item">
            <label className="cursos-filtro-etiqueta" htmlFor="filtro-docente">
              <UserCheck size={14} /> DOCENTE (ID)
            </label>
            <form
              onSubmit={manejarBuscarDocente}
              className="cursos-filtro-docente-grupo"
            >
              <input
                id="filtro-docente"
                type="number"
                min="1"
                className="cursos-campo"
                placeholder="ID DOCENTE..."
                value={docenteIdFiltro}
                onChange={(e) => setDocenteIdFiltro(e.target.value)}
              />
              <button
                type="submit"
                className="cursos-btn-buscar-docente"
                disabled={cargando}
                title="Buscar por docente"
              >
                <Search size={16} />
              </button>
            </form>
          </div>
        </div>

        <button
          type="button"
          className="cursos-btn-limpiar"
          onClick={manejarActualizar}
          disabled={cargando}
        >
          <Eraser size={16} />
          LIMPIAR
        </button>
      </div>

      {/* Tarjeta de la Tabla */}
      <div className="usuarios-panel cursos-tabla-card">
        <div className="cursos-tabla-cabecera">
          <div className="cursos-cabecera-icono">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="cursos-tabla-titulo">Listado de Cursos</h2>
            <p className="cursos-tabla-subtitulo">
              Oferta académica, cupos disponibles y estado docente
            </p>
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
                        <small className="cursos-cupos-porcentaje">
                          ({curso.porcentajeOcupacion}%)
                        </small>
                        <div className="cursos-barra-cupos-track">
                          <div
                            className={`cursos-barra-cupos-fill ${
                              curso.alertaCupo === "AGOTADO" ||
                              curso.cuposDisponibles === 0
                                ? "fill-agotado"
                                : curso.alertaCupo === "ULTIMOS_CUPOS"
                                ? "fill-ultimos"
                                : "fill-disponible"
                            }`}
                            style={{
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
        <div className="usuarios-modal-fondo gestion-cursos">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Detalle del curso"
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
                <div className="cursos-modal-cabecera">
                  <span className="usuarios-etiqueta">DETALLE ACADÉMICO</span>
                  <h3>
                    {detalleCurso.codigo} — {detalleCurso.nombre}
                  </h3>
                  <p>Información completa y estado de la asignatura</p>
                </div>
                <div className="cursos-modal-separador" />

                <div className="cursos-detalle-grid">
                  <div>
                    <span className="cursos-detalle-label">ID:</span>
                    <strong>{detalleCurso.id}</strong>
                  </div>
                  <div>
                    <span className="cursos-detalle-label">Ciclo:</span>
                    <strong>Ciclo {detalleCurso.ciclo}</strong>
                  </div>
                  <div>
                    <span className="cursos-detalle-label">Créditos:</span>
                    <strong>{detalleCurso.creditos}</strong>
                  </div>
                  <div>
                    <span className="cursos-detalle-label">Estado:</span>
                    {renderEstado(detalleCurso.estado)}
                  </div>
                  <div>
                    <span className="cursos-detalle-label">Cupos totales:</span>
                    <strong>{detalleCurso.cuposTotales}</strong>
                  </div>
                  <div>
                    <span className="cursos-detalle-label">Cupos disponibles:</span>
                    <strong>
                      {detalleCurso.cuposDisponibles} ({detalleCurso.porcentajeOcupacion}%)
                    </strong>
                  </div>
                </div>

                <div className="cursos-detalle-seccion">
                  <span className="cursos-detalle-label">Mensaje de cupo:</span>
                  <p className="cursos-detalle-texto">
                    {detalleCurso.mensajeCupo || "Sin alertas de cupo."}
                  </p>
                </div>

                <div className="cursos-detalle-seccion">
                  <span className="cursos-detalle-label">Docente:</span>
                  <p className="cursos-detalle-texto">
                    {detalleCurso.docenteNombre || "Por asignar"}
                    {detalleCurso.docenteId ? ` (ID: ${detalleCurso.docenteId})` : ""}
                    {detalleCurso.docenteCorreo ? ` — ${detalleCurso.docenteCorreo}` : ""}
                  </p>
                </div>

                <div className="cursos-detalle-seccion">
                  <span className="cursos-detalle-label">Prerrequisitos:</span>
                  {detalleCurso.prerrequisitos && detalleCurso.prerrequisitos.length > 0 ? (
                    <ul style={{ margin: "4px 0", paddingLeft: "20px", color: "#334155" }}>
                      {detalleCurso.prerrequisitos.map((pre) => (
                        <li key={pre.id}>
                          <strong>{pre.codigo}</strong> – {pre.nombre} (Ciclo {pre.ciclo})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: "4px 0", color: "#64748b" }}>Ninguno</p>
                  )}
                </div>

                {(detalleCurso.estado === "CANCELADO" || detalleCurso.motivoCancelacion) && (
                  <div className="cursos-alerta-cancelacion">
                    <span style={{ color: "#991b1b", fontWeight: "bold", display: "block" }}>
                      Información de cancelación
                    </span>
                    <p>
                      <strong>Motivo:</strong> {detalleCurso.motivoCancelacion || "—"}
                    </p>
                    <p>
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
        <div className="usuarios-modal-fondo gestion-cursos">
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
              <div className="cursos-modal-cabecera">
                <span className="usuarios-etiqueta">
                  {cursoEditando ? "EDICIÓN" : "CREACIÓN"}
                </span>
                <h3>{cursoEditando ? "Editar curso" : "Nuevo curso"}</h3>
                <p>
                  {cursoEditando
                    ? "Actualiza los parámetros y requerimientos del curso"
                    : "Ingresa los datos para registrar una nueva asignatura"}
                </p>
              </div>
              <div className="cursos-modal-separador" />

              <div className="cursos-form-grid">
                <div className="cursos-form-campo">
                  <label htmlFor="curso-codigo" className="cursos-campo-label">
                    <Tag size={14} /> CÓDIGO
                  </label>
                  <input
                    id="curso-codigo"
                    className="cursos-campo"
                    type="text"
                    value={formCurso.codigo}
                    onChange={(e) =>
                      setFormCurso((prev) => ({ ...prev, codigo: e.target.value }))
                    }
                    placeholder="EJ. MAT101"
                    required
                  />
                </div>

                <div className="cursos-form-campo">
                  <label htmlFor="curso-ciclo" className="cursos-campo-label">
                    <Layers size={14} /> CICLO (1–10)
                  </label>
                  <select
                    id="curso-ciclo"
                    className="cursos-campo"
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
                        CICLO {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cursos-form-campo cursos-col-span-2">
                  <label htmlFor="curso-nombre" className="cursos-campo-label">
                    <BookOpen size={14} /> NOMBRE DEL CURSO
                  </label>
                  <input
                    id="curso-nombre"
                    className="cursos-campo"
                    type="text"
                    value={formCurso.nombre}
                    onChange={(e) =>
                      setFormCurso((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                    placeholder="EJ. CÁLCULO I"
                    required
                  />
                </div>

                <div className="cursos-form-campo">
                  <label htmlFor="curso-creditos" className="cursos-campo-label">
                    <Award size={14} /> CRÉDITOS (≥ 1)
                  </label>
                  <input
                    id="curso-creditos"
                    className="cursos-campo"
                    type="number"
                    min="1"
                    value={formCurso.creditos}
                    onChange={(e) =>
                      setFormCurso((prev) => ({ ...prev, creditos: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="cursos-form-campo">
                  <label htmlFor="curso-cupos" className="cursos-campo-label">
                    <Users size={14} /> CUPOS TOTALES (≥ 0)
                  </label>
                  <input
                    id="curso-cupos"
                    className="cursos-campo"
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
                </div>

                <div className="cursos-form-campo cursos-col-span-2">
                  <label className="cursos-campo-label">
                    <BookOpen size={14} /> PRERREQUISITOS
                  </label>
                  <div className="cursos-lista-seleccion">
                    {todosLosCursos.filter(
                      (c) => !cursoEditando || c.id !== cursoEditando.id
                    ).length === 0 ? (
                      <small style={{ color: "#64748b" }}>
                        No hay otros cursos disponibles para seleccionar como prerrequisito.
                      </small>
                    ) : (
                      todosLosCursos
                        .filter((c) => !cursoEditando || c.id !== cursoEditando.id)
                        .map((c) => (
                          <label key={c.id} className="cursos-checkbox-item">
                            <input
                              type="checkbox"
                              checked={formCurso.prerrequisitosIds.includes(c.id)}
                              onChange={() => alternarPrerrequisito(c.id)}
                            />
                            <span>
                              <strong>{c.codigo}</strong> — {c.nombre} (Ciclo {c.ciclo})
                            </span>
                          </label>
                        ))
                    )}
                  </div>
                </div>
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
        <div className="usuarios-modal-fondo gestion-cursos">
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
              <div className="cursos-modal-cabecera">
                <span className="usuarios-etiqueta">DOCENTE</span>
                <h3>Asignar docente a {cursoDocente?.codigo}</h3>
                <p>Vincula un profesor responsable para esta asignatura</p>
              </div>
              <div className="cursos-modal-separador" />

              <div className="cursos-form-grid">
                <div className="cursos-form-campo">
                  <label htmlFor="docente-id" className="cursos-campo-label">
                    <UserCheck size={14} /> ID DEL DOCENTE
                  </label>
                  <input
                    id="docente-id"
                    className="cursos-campo"
                    type="number"
                    min="1"
                    value={formDocente.docenteId}
                    onChange={(e) =>
                      setFormDocente((prev) => ({
                        ...prev,
                        docenteId: e.target.value,
                      }))
                    }
                    placeholder="EJ. 10"
                    required
                  />
                </div>

                <div className="cursos-form-campo">
                  <label htmlFor="docente-nombre" className="cursos-campo-label">
                    <UserCheck size={14} /> NOMBRE DEL DOCENTE
                  </label>
                  <input
                    id="docente-nombre"
                    className="cursos-campo"
                    type="text"
                    value={formDocente.docenteNombre}
                    onChange={(e) =>
                      setFormDocente((prev) => ({
                        ...prev,
                        docenteNombre: e.target.value,
                      }))
                    }
                    placeholder="EJ. MG. JUAN PÉREZ"
                    required
                  />
                </div>

                <div className="cursos-form-campo cursos-col-span-2">
                  <label htmlFor="docente-correo" className="cursos-campo-label">
                    <Mail size={14} /> CORREO ELECTRÓNICO (OPCIONAL)
                  </label>
                  <input
                    id="docente-correo"
                    className="cursos-campo"
                    type="email"
                    value={formDocente.docenteCorreo}
                    onChange={(e) =>
                      setFormDocente((prev) => ({
                        ...prev,
                        docenteCorreo: e.target.value,
                      }))
                    }
                    placeholder="DOCENTE@UNIVERSIDAD.EDU.PE"
                  />
                </div>
              </div>

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
        <div className="usuarios-modal-fondo gestion-cursos">
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
              <div className="cursos-modal-cabecera">
                <span className="usuarios-etiqueta">CANCELACIÓN</span>
                <h3>Cancelar curso {cursoCancelar?.codigo}</h3>
                <p>
                  Esta acción cancelará la oferta del curso y notificará a los estudiantes inscritos.
                </p>
              </div>
              <div className="cursos-modal-separador" />

              <div className="cursos-form-grid">
                <div className="cursos-form-campo cursos-col-span-2">
                  <label htmlFor="cancelar-por" className="cursos-campo-label">
                    <UserCheck size={14} /> CANCELADO POR
                  </label>
                  <input
                    id="cancelar-por"
                    className="cursos-campo"
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
                </div>

                <div className="cursos-form-campo cursos-col-span-2">
                  <label htmlFor="cancelar-motivo" className="cursos-campo-label">
                    <FileText size={14} /> MOTIVO DE CANCELACIÓN (10–500 CARACTERES)
                  </label>
                  <textarea
                    id="cancelar-motivo"
                    rows={4}
                    className="cursos-textarea"
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
                  />
                  <small
                    style={{
                      color:
                        formCancelar.motivo.length < 10 ||
                        formCancelar.motivo.length > 500
                          ? "#dc2626"
                          : "#64748b",
                    }}
                  >
                    {formCancelar.motivo.length} / 500 caracteres (mínimo 10)
                  </small>
                </div>
              </div>

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
                  className="cursos-btn-peligro"
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
        <div className="usuarios-modal-fondo gestion-cursos">
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
              <div className="cursos-modal-cabecera">
                <span className="usuarios-etiqueta">CONFIRMACIÓN</span>
                <h3>Dar de baja curso</h3>
                <p>Procedimiento de retiro definitivo de la oferta académica</p>
              </div>
              <div className="cursos-modal-separador" />

              <p style={{ color: "#0f172a", fontSize: "15px" }}>
                ¿Deseas dar de baja el curso{" "}
                <strong>
                  {cursoBaja?.codigo} — {cursoBaja?.nombre}
                </strong>
                ?
              </p>
              <div className="cursos-alerta-cancelacion">
                <p>
                  El curso quedará cancelado ("Baja administrativa del curso") y dejará de aparecer en la oferta académica.
                </p>
              </div>

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
                  className="cursos-btn-peligro"
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
        <div className="usuarios-modal-fondo gestion-cursos">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Consultar disponibilidad"
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={() => setModalDisponibilidad(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="usuarios-formulario">
              <div className="cursos-modal-cabecera">
                <span className="usuarios-etiqueta">SIMULADOR ACADÉMICO</span>
                <h3>Consultar disponibilidad de cursos</h3>
                <p>
                  Evalúa qué asignaturas están habilitadas según el ciclo actual del estudiante y sus cursos aprobados.
                </p>
              </div>
              <div className="cursos-modal-separador" />

              <form onSubmit={ejecutarConsultaDisponibilidad}>
                <div className="cursos-form-grid">
                  <div className="cursos-form-campo cursos-col-span-2">
                    <label htmlFor="disp-ciclo" className="cursos-campo-label">
                      <GraduationCap size={14} /> CICLO DEL ESTUDIANTE (1–10)
                    </label>
                    <select
                      id="disp-ciclo"
                      className="cursos-campo"
                      value={cicloEstudiante}
                      onChange={(e) => setCicloEstudiante(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                        <option key={c} value={c}>
                          CICLO {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="cursos-form-campo cursos-col-span-2">
                    <label className="cursos-campo-label">
                      <CircleCheck size={14} /> CURSOS APROBADOS PREVIAMENTE
                    </label>
                    <div className="cursos-lista-seleccion">
                      {todosLosCursos.length === 0 ? (
                        <small style={{ color: "#64748b" }}>
                          No hay cursos disponibles para seleccionar.
                        </small>
                      ) : (
                        todosLosCursos.map((c) => (
                          <label key={c.id} className="cursos-checkbox-item">
                            <input
                              type="checkbox"
                              checked={cursosAprobadosIds.includes(c.id)}
                              onChange={() => alternarCursoAprobado(c.id)}
                            />
                            <span>
                              <strong>{c.codigo}</strong> — {c.nombre} (Ciclo {c.ciclo})
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {errorDisponibilidad && (
                  <p className="usuarios-error" role="alert">
                    {errorDisponibilidad}
                  </p>
                )}

                <div
                  className="usuarios-formulario-acciones"
                  style={{ marginTop: "16px" }}
                >
                  <button type="submit" disabled={cargandoDisponibilidad}>
                    {cargandoDisponibilidad
                      ? "Consultando..."
                      : "Consultar disponibilidad"}
                  </button>
                </div>
              </form>

              {resultadoDisponibilidad && (
                <div style={{ marginTop: "20px" }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: "16px", color: "#0f172a" }}>
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
                                      ? "cursos-pill pill-activo"
                                      : "cursos-pill pill-cancelado"
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
