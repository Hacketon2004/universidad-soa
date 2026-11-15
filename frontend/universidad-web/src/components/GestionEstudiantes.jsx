
import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Pencil, UserCheck, UserX, RefreshCw,
  GraduationCap, Users, X, Save, ArrowLeft
} from "lucide-react";
import {
  obtenerEstudiantes,
  crearEstudiante,
  editarEstudiante,
  cambiarEstadoEstudiante
} from "../services/api";
import "./GestionEstudiantes.css";

const formularioInicial = {
  codigoEstudiante: "",
  dni: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  fechaNacimiento: "",
  direccion: "",
  carrera: "",
  cicloActual: 1
};

export default function GestionEstudiantes({ token }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [guardando, setGuardando] = useState(false);

  async function cargarEstudiantes() {
    setCargando(true);
    setError("");
    try {
      const datos = await obtenerEstudiantes(token);
      setEstudiantes(Array.isArray(datos) ? datos : datos.content || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los estudiantes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEstudiantes();
  }, [token]);

  const filtrados = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return estudiantes.filter((e) =>
      `${e.nombres} ${e.apellidos} ${e.dni} ${e.codigo}`
        .toLowerCase().includes(texto)
    );
  }, [estudiantes, busqueda]);

  function abrirNuevo() {
    setEditando(null);
    setFormulario(formularioInicial);
    setModal(true);
  }

  function abrirEdicion(estudiante) {
    setEditando(estudiante);
    setFormulario({
      codigoEstudiante: estudiante.codigo || "",
      dni: estudiante.dni || "",
      nombres: estudiante.nombres || "",
      apellidos: estudiante.apellidos || "",
      telefono: estudiante.telefono || "",
      fechaNacimiento: estudiante.fechaNacimiento || "",
      direccion: estudiante.direccion || "",
      carrera: estudiante.carrera || "",
      cicloActual: estudiante.cicloActual || 1
    });
    setModal(true);
  }

  function cambiarCampo(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const datos = {
        ...formulario,
        cicloActual: Number(formulario.cicloActual)
      };
      if (editando) {
        await editarEstudiante(token, editando.id, datos);
      } else {
        await crearEstudiante(token, datos);
      }
      setModal(false);
      await cargarEstudiantes();
    } catch (err) {
      setError(err.message || "No se pudo guardar el estudiante.");
    } finally {
      setGuardando(false);
    }
  }

  async function alternarEstado(estudiante) {
    try {
      await cambiarEstadoEstudiante(
        token,
        estudiante.id,
        !estudiante.activo
      );
      await cargarEstudiantes();
    } catch (err) {
      setError(err.message || "No se pudo cambiar el estado.");
    }
  }

  const activos = estudiantes.filter(e => e.activo).length;

  return (
    <section className="ge-contenedor">
      <div className="ge-encabezado">
        <div>
          <span className="ge-etiqueta">GESTIÓN ACADÉMICA</span>
          <h1>Gestión de estudiantes</h1>
          <p>Administra la información y los registros estudiantiles.</p>
        </div>
        <button className="ge-boton-principal" onClick={abrirNuevo}>
          <Plus size={19}/> Nuevo estudiante
        </button>
      </div>

      <div className="ge-estadisticas">
        <article className="ge-estadistica">
          <div className="ge-estadistica-icono"><Users/></div>
          <div><span>Total estudiantes</span><strong>{estudiantes.length}</strong></div>
        </article>
        <article className="ge-estadistica">
          <div className="ge-estadistica-icono"><UserCheck/></div>
          <div><span>Estudiantes activos</span><strong>{activos}</strong></div>
        </article>
        <article className="ge-estadistica">
          <div className="ge-estadistica-icono"><UserX/></div>
          <div><span>Inactivos</span><strong>{estudiantes.length - activos}</strong></div>
        </article>
      </div>

      <div className="ge-panel">
        <div className="ge-panel-superior">
          <div>
            <h2>Directorio de estudiantes</h2>
            <p>Consulta y administra los registros.</p>
          </div>
          <button className="ge-boton-icono" onClick={cargarEstudiantes} title="Actualizar">
            <RefreshCw size={18}/>
          </button>
        </div>

        <div className="ge-busqueda">
          <Search size={19}/>
          <input
            placeholder="Buscar por nombre, DNI o código..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        {error && <div className="ge-error">{error}</div>}

        <div className="ge-tabla-scroll">
          <table className="ge-tabla">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Código</th>
                <th>DNI</th>
                <th>Carrera</th>
                <th>Ciclo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="7" className="ge-vacio">Cargando estudiantes...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan="7" className="ge-vacio">No se encontraron estudiantes.</td></tr>
              ) : filtrados.map(e => (
                <tr key={e.id}>
                  <td>
                    <div className="ge-persona">
                      <div className="ge-avatar">{e.nombres?.charAt(0)}{e.apellidos?.charAt(0)}</div>
                      <strong>{e.nombres} {e.apellidos}</strong>
                    </div>
                  </td>
                  <td>{e.codigo || "—"}</td>
                  <td>{e.dni}</td>
                  <td>{e.carrera}</td>
                  <td>{e.cicloActual}</td>
                  <td><span className={`ge-estado ${e.activo ? "activo" : "inactivo"}`}>{e.activo ? "Activo" : "Inactivo"}</span></td>
                  <td>
                    <div className="ge-acciones">
                      <button title="Editar" onClick={() => abrirEdicion(e)}><Pencil size={17}/></button>
                      <button title={e.activo ? "Desactivar" : "Activar"} onClick={() => alternarEstado(e)}>
                        {e.activo ? <UserX size={17}/> : <UserCheck size={17}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="ge-modal-fondo">
          <form className="ge-modal" onSubmit={guardar}>
            <div className="ge-modal-cabecera">
              <div>
                <span className="ge-etiqueta">REGISTRO ACADÉMICO</span>
                <h2>{editando ? "Editar estudiante" : "Nuevo estudiante"}</h2>
              </div>
              <button type="button" className="ge-boton-icono" onClick={() => setModal(false)}><X/></button>
            </div>

            <div className="ge-form-grid">
              {[
                ["codigoEstudiante", "Código de estudiante"],
                ["dni", "DNI"],
                ["nombres", "Nombres"],
                ["apellidos", "Apellidos"],
                ["telefono", "Teléfono"],
                ["fechaNacimiento", "Fecha de nacimiento", "date"],
                ["direccion", "Dirección"],
                ["carrera", "Carrera"]
              ].map(([name, label, type]) => (
                <label key={name}>
                  {label}
                  <input
                    name={name}
                    type={type || "text"}
                    value={formulario[name]}
                    onChange={cambiarCampo}
                    required={["codigoEstudiante","dni","nombres","apellidos","carrera"].includes(name)}
                  />
                </label>
              ))}
              <label>
                Ciclo actual
                <input name="cicloActual" type="number" min="1" max="20" value={formulario.cicloActual} onChange={cambiarCampo} required/>
              </label>
            </div>

            {error && <div className="ge-error">{error}</div>}

            <div className="ge-modal-acciones">
              <button type="button" className="ge-boton-secundario" onClick={() => setModal(false)}>Cancelar</button>
              <button type="submit" className="ge-boton-principal" disabled={guardando}>
                <Save size={18}/>{guardando ? "Guardando..." : "Guardar estudiante"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
