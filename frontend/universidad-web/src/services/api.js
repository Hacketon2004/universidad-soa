
const API_URL = "/api";

// ===============================
// AUTENTICACION
// ===============================

export async function iniciarSesion(correo, password) {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, password }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Correo o contrasena incorrectos");
  }

  return datos;
}

// ===============================
// GESTION DE USUARIOS
// ===============================

export async function obtenerUsuarios(token) {
  const respuesta = await fetch("/api/usuarios", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    if (respuesta.status === 403) {
      throw new Error("No tienes permisos para consultar los usuarios");
    }

    throw new Error("No se pudo obtener la lista de usuarios");
  }

  return await respuesta.json();
}

async function solicitudAdministrativa(ruta, metodo, token, datos) {
  const respuesta = await fetch(`/api/usuarios${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(datos ? { "Content-Type": "application/json" } : {}),
    },
    ...(datos ? { body: JSON.stringify(datos) } : {}),
  });

  const resultado = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(
      resultado.mensaje ||
        `No se pudo completar la operacion (${respuesta.status})`
    );
  }

  return resultado;
}

export function crearUsuario(token, datos) {
  return solicitudAdministrativa("", "POST", token, datos);
}

export function editarUsuario(token, id, datos) {
  return solicitudAdministrativa(
    `/${encodeURIComponent(id)}`,
    "PUT",
    token,
    datos
  );
}

export function cambiarEstadoUsuario(token, id, activo) {
  return solicitudAdministrativa(
    `/${encodeURIComponent(id)}/estado`,
    "PATCH",
    token,
    { activo }
  );
}

export function restablecerPasswordUsuario(token, id, nuevaPassword) {
  return solicitudAdministrativa(
    `/${encodeURIComponent(id)}/password`,
    "PATCH",
    token,
    { nuevaPassword }
  );
}

// ===============================
// GESTION DE ESTUDIANTES
// ===============================

async function solicitudEstudiantes(ruta, metodo, token, datos) {
  const respuesta = await fetch(`/api/estudiantes${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(datos ? { "Content-Type": "application/json" } : {}),
    },
    ...(datos ? { body: JSON.stringify(datos) } : {}),
  });

  const resultado = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(
      resultado.mensaje || `Error en estudiantes: ${respuesta.status}`
    );
  }

  return resultado;
}

export function obtenerEstudiantes(token) {
  return solicitudEstudiantes("", "GET", token);
}

export function crearEstudiante(token, datos) {
  return solicitudEstudiantes("", "POST", token, datos);
}

export function editarEstudiante(token, id, datos) {
  return solicitudEstudiantes(
    `/${encodeURIComponent(id)}`,
    "PUT",
    token,
    datos
  );
}

export function cambiarEstadoEstudiante(token, id, activo) {
  return solicitudEstudiantes(
    `/${encodeURIComponent(id)}/estado`,
    "PATCH",
    token,
    { activo }
  );
}

// ===============================
// GESTION DE MATRICULAS
// ===============================

async function solicitudMatricula(ruta, metodo, token, datos) {
  const respuesta = await fetch(`${API_URL}/matriculas${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(datos ? { "Content-Type": "application/json" } : {}),
    },
    ...(datos ? { body: JSON.stringify(datos) } : {}),
  });

  const resultado = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error("Tu sesion expiro. Vuelve a iniciar sesion.");
    }

    if (respuesta.status === 403) {
      throw new Error("No tienes permisos para gestionar matriculas.");
    }

    throw new Error(
      resultado.mensaje ||
        `No se pudo completar la operacion (${respuesta.status})`
    );
  }

  return resultado;
}

export function obtenerMatriculasPorEstudiante(token, estudianteId) {
  return solicitudMatricula(
    `/estudiante/${encodeURIComponent(estudianteId)}`,
    "GET",
    token
  );
}

export function registrarMatricula(token, datos) {
  return solicitudMatricula("", "POST", token, datos);
}

export function anularMatricula(token, id) {
  return solicitudMatricula(
    `/${encodeURIComponent(id)}/anular`,
    "PUT",
    token
  );
}
