import { useState } from "react";

export default function FormularioUsuario({
  usuario,
  onGuardar,
  onCancelar,
  guardando,
}) {
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [correo, setCorreo] = useState(usuario?.correo || "");
  const [rol, setRol] = useState(usuario?.rol || "ESTUDIANTE");
  const [password, setPassword] = useState("");

  const editando = Boolean(usuario);

  function enviar(evento) {
    evento.preventDefault();

    const datos = {
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      rol,
    };

    if (!editando) {
      datos.password = password;
    }

    onGuardar(datos);
  }

  return (
    <form onSubmit={enviar} className="usuarios-formulario">
      <h3>{editando ? "Editar usuario" : "Registrar usuario"}</h3>

      <label htmlFor="usuario-nombre">Nombre completo</label>
      <input
        id="usuario-nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <label htmlFor="usuario-correo">Correo electrónico</label>
      <input
        id="usuario-correo"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />

      <label htmlFor="usuario-rol">Rol institucional</label>
      <select
        id="usuario-rol"
        value={rol}
        onChange={(e) => setRol(e.target.value)}
      >
        <option value="ADMINISTRADOR">Administrador</option>
        <option value="SECRETARIA">Secretaría</option>
        <option value="DOCENTE">Docente</option>
        <option value="ESTUDIANTE">Estudiante</option>
      </select>

      {!editando && (
        <>
          <label htmlFor="usuario-password">Contraseña inicial</label>
          <input
            id="usuario-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={12}
            autoComplete="new-password"
            required
          />
          <small>Mínimo 12 caracteres.</small>
        </>
      )}

      <div className="usuarios-formulario-acciones">
        <button type="button" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>

        <button type="submit" disabled={guardando}>
          {guardando
            ? "Guardando..."
            : editando
              ? "Guardar cambios"
              : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
