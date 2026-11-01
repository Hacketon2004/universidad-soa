import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  KeyRound,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Users,
  X,
} from "lucide-react";

import {
  obtenerUsuarios,
  crearUsuario,
  editarUsuario,
  cambiarEstadoUsuario,
  restablecerPasswordUsuario,
} from "../services/api";

import FormularioUsuario from "./FormularioUsuario";
import "./GestionUsuarios.css";

export default function GestionUsuarios({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modal, setModal] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState("");

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await obtenerUsuarios(token);
      setUsuarios(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto =
      `${usuario.nombre} ${usuario.correo} ${usuario.rol}`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  function abrirModal(tipo, usuario = null) {
    setModal(tipo);
    setUsuarioSeleccionado(usuario);
    setNuevaPassword("");
    setError("");
    setMensaje("");
  }

  function cerrarModal() {
    if (guardando) return;

    setModal(null);
    setUsuarioSeleccionado(null);
    setNuevaPassword("");
  }

  async function guardarUsuario(datos) {
    setGuardando(true);
    setError("");

    try {
      if (modal === "crear") {
        await crearUsuario(token, datos);
        setMensaje("Usuario registrado correctamente.");
      } else if (modal === "editar" && usuarioSeleccionado) {
        await editarUsuario(token, usuarioSeleccionado.id, datos);
        setMensaje("Usuario actualizado correctamente.");
      }

      setModal(null);
      setUsuarioSeleccionado(null);
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(usuario) {
    const accion = usuario.activo ? "desactivar" : "activar";

    if (!window.confirm(`¿Deseas ${accion} la cuenta de ${usuario.nombre}?`)) {
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await cambiarEstadoUsuario(token, usuario.id, !usuario.activo);
      setMensaje(
        `Cuenta ${usuario.activo ? "desactivada" : "activada"} correctamente.`,
      );
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarPassword(evento) {
    evento.preventDefault();

    if (!usuarioSeleccionado || nuevaPassword.length < 12) {
      setError("La contraseña debe tener al menos 12 caracteres.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      await restablecerPasswordUsuario(
        token,
        usuarioSeleccionado.id,
        nuevaPassword,
      );

      setMensaje("Contraseña restablecida correctamente.");
      setNuevaPassword("");
      setModal(null);
      setUsuarioSeleccionado(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="gestion-usuarios">
      <div className="usuarios-cabecera">
        <div>
          <span className="usuarios-etiqueta">ADMINISTRACIÓN</span>
          <h1>Gestión de Usuarios</h1>
          <p>Administra las cuentas y permisos institucionales.</p>
        </div>

        <button
          className="usuarios-boton-principal"
          onClick={() => abrirModal("crear")}
        >
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      <div className="usuarios-resumen">
        <div>
          <Users size={23} />
          <span>Total de usuarios</span>
          <strong>{usuarios.length}</strong>
        </div>
        <div>
          <UserCheck size={23} />
          <span>Activos</span>
          <strong>{usuarios.filter((u) => u.activo).length}</strong>
        </div>
        <div>
          <UserX size={23} />
          <span>Inactivos</span>
          <strong>{usuarios.filter((u) => !u.activo).length}</strong>
        </div>
      </div>

      <div className="usuarios-panel">
        <div className="usuarios-herramientas">
          <div className="usuarios-busqueda">
            <Search size={19} />
            <input
              type="search"
              placeholder="Buscar por nombre, correo o rol..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <button
            className="usuarios-boton-secundario"
            onClick={cargarUsuarios}
            disabled={cargando}
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

        {error && (
          <p className="usuarios-error" role="alert">
            {error}
          </p>
        )}

        {cargando ? (
          <p className="usuarios-vacio">Cargando usuarios...</p>
        ) : (
          <div className="usuarios-tabla-contenedor">
            <table className="usuarios-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.correo}</td>
                    <td>
                      <span className="usuarios-rol">{usuario.rol}</span>
                    </td>
                    <td>
                      <span
                        className={
                          usuario.activo
                            ? "usuarios-estado activo"
                            : "usuarios-estado inactivo"
                        }
                      >
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="usuarios-acciones">
                        <button
                          title="Editar usuario"
                          onClick={() => abrirModal("editar", usuario)}
                          disabled={guardando}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title={usuario.activo ? "Desactivar" : "Activar"}
                          onClick={() => cambiarEstado(usuario)}
                          disabled={guardando}
                        >
                          {usuario.activo ? (
                            <UserX size={17} />
                          ) : (
                            <UserCheck size={17} />
                          )}
                        </button>

                        <button
                          title="Restablecer contraseña"
                          onClick={() => abrirModal("password", usuario)}
                          disabled={guardando}
                        >
                          <KeyRound size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {usuariosFiltrados.length === 0 && (
              <p className="usuarios-vacio">No se encontraron usuarios.</p>
            )}
          </div>
        )}
      </div>

      {modal && (
        <div className="usuarios-modal-fondo">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "password"
                ? "Restablecer contraseña"
                : "Formulario de usuario"
            }
          >
            <button
              className="usuarios-modal-cerrar"
              onClick={cerrarModal}
              disabled={guardando}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            {modal === "password" ? (
              <form onSubmit={guardarPassword} className="usuarios-formulario">
                <h3>Restablecer contraseña</h3>
                <p>{usuarioSeleccionado?.nombre}</p>

                <label htmlFor="nueva-password">Nueva contraseña</label>

                <input
                  id="nueva-password"
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  minLength={12}
                  autoComplete="new-password"
                  required
                />

                <small>Mínimo 12 caracteres.</small>

                <div className="usuarios-formulario-acciones">
                  <button type="button" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Restablecer"}
                  </button>
                </div>
              </form>
            ) : (
              <FormularioUsuario
                key={`${modal}-${usuarioSeleccionado?.id || "nuevo"}`}
                usuario={usuarioSeleccionado}
                onGuardar={guardarUsuario}
                onCancelar={cerrarModal}
                guardando={guardando}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
