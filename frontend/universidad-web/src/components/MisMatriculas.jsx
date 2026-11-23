import { useEffect, useState } from "react";
import { RefreshCw, ClipboardList, CircleCheck, CircleX } from "lucide-react";

import { obtenerMisMatriculas, obtenerCursos } from "../services/api";
import "./GestionUsuarios.css";

export default function MisMatriculas({ token }) {
  const [matriculas, setMatriculas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

  const activas = matriculas.filter((m) => m.estado === "ACTIVA").length;
  const anuladas = matriculas.filter((m) => m.estado === "ANULADA").length;

  return (
    <section className="gestion-usuarios">
      <div className="usuarios-cabecera">
        <div>
          <span className="usuarios-etiqueta">ACADÉMICO</span>
          <h1>Mis matrículas</h1>
          <p>Consulta los cursos en los que estás matriculado.</p>
        </div>

        <button
          type="button"
          className="usuarios-boton-secundario"
          onClick={cargar}
          disabled={cargando}
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
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
    </section>
  );
}
