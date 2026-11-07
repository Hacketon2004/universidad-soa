import { useState } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  ClipboardList,
  UserRoundCog,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
  Clock3,
} from "lucide-react";

import GestionUsuarios from "./GestionUsuarios";
import GestionEstudiantes from "./GestionEstudiantes";
import "./Dashboard.css";

const modulos = [
  {
    id: "usuarios",
    nombre: "Gestión de usuarios",
    descripcion: "Administración de cuentas y permisos.",
    icono: UserRoundCog,
    disponible: true,
    roles: ["ADMINISTRADOR"],
  },
  {
    id: "estudiantes",
    nombre: "Estudiantes",
    descripcion: "Información y registros estudiantiles.",
    icono: Users,
    disponible: true,
    roles: ["ADMINISTRADOR", "SECRETARIA"],
  },
  {
    id: "cursos",
    nombre: "Cursos",
    descripcion: "Oferta académica y asignaturas.",
    icono: BookOpen,
    disponible: false,
    roles: ["ADMINISTRADOR", "SECRETARIA", "DOCENTE", "ESTUDIANTE"],
  },
  {
    id: "finanzas",
    nombre: "Finanzas",
    descripcion: "Pagos y obligaciones financieras.",
    icono: Wallet,
    disponible: false,
    roles: ["ADMINISTRADOR", "SECRETARIA", "ESTUDIANTE"],
  },
  {
    id: "matriculas",
    nombre: "Matrículas",
    descripcion: "Inscripciones y seguimiento académico.",
    icono: ClipboardList,
    disponible: false,
    roles: ["ADMINISTRADOR", "SECRETARIA", "ESTUDIANTE"],
  },
];

function Dashboard({ sesion, onCerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seccion, setSeccion] = useState("inicio");

  const rol = sesion.rol;

  const modulosPermitidos = modulos.filter((modulo) =>
    modulo.roles.includes(rol),
  );

  const moduloSeleccionado = modulosPermitidos.find(
    (modulo) => modulo.id === seccion,
  );

  function navegar(destino) {
    setSeccion(destino);
    setMenuAbierto(false);
  }

  return (
    <div className="dashboard">
      <aside className={`sidebar ${menuAbierto ? "abierto" : ""}`}>
        <div className="sidebar-marca">
          <div className="sidebar-logo">
            <GraduationCap size={28} />
          </div>
          <div>
            <strong>Nueva Generación</strong>
            <span>Gestión Académica</span>
          </div>
        </div>

        <div className="sidebar-etiqueta">NAVEGACIÓN</div>

        <nav className="sidebar-nav" aria-label="Menú principal">
          <button
            className={seccion === "inicio" ? "activo" : ""}
            onClick={() => navegar("inicio")}
          >
            <LayoutDashboard size={19} />
            Panel principal
          </button>

          {modulosPermitidos.map((modulo) => {
            const Icono = modulo.icono;

            return (
              <button
                key={modulo.id}
                className={seccion === modulo.id ? "activo" : ""}
                onClick={() => navegar(modulo.id)}
              >
                <Icono size={19} />
                {modulo.nombre}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-inferior">
          <div className="sidebar-seguridad">
            <ShieldCheck size={18} />
            <span>Sesión autenticada</span>
          </div>

          <button className="sidebar-salir" onClick={onCerrarSesion}>
            <LogOut size={19} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {menuAbierto && (
        <button
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <div className="dashboard-contenido">
        <header className="dashboard-header">
          <div className="dashboard-header-izquierda">
            <button
              className="dashboard-menu-movil"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            >
              {menuAbierto ? <X size={23} /> : <Menu size={23} />}
            </button>

            <div>
              <strong>Universidad Privada Nueva Generación</strong>
              <span>Portal institucional</span>
            </div>
          </div>

          <div className="dashboard-usuario">
            <div className="usuario-avatar">
              <Users size={19} />
            </div>
            <span>
              {sesion.nombre} · {sesion.rol}
            </span>
          </div>
        </header>

        <main className="dashboard-main">
          {seccion === "inicio" ? (
            <>
              <div className="dashboard-bienvenida">
                <div>
                  <span className="dashboard-sobretitulo">
                    PANEL DE CONTROL
                  </span>
                  <h1>Bienvenido al sistema</h1>
                  <p>
                    Accede a los módulos de gestión académica desde un solo
                    lugar.
                  </p>
                </div>
                <div className="dashboard-bienvenida-icono">
                  <GraduationCap size={58} strokeWidth={1.5} />
                </div>
              </div>

              <div className="dashboard-seccion-titulo">
                <div>
                  <h2>Módulos del sistema</h2>
                  <p>Selecciona el área que deseas consultar.</p>
                </div>
              </div>

              <div className="dashboard-grid">
                {modulosPermitidos.map((modulo) => {
                  const Icono = modulo.icono;

                  return (
                    <button
                      key={modulo.id}
                      className="modulo-card"
                      onClick={() => navegar(modulo.id)}
                    >
                      <div className="modulo-card-superior">
                        <div className="modulo-icono">
                          <Icono size={25} />
                        </div>
                        <span className="modulo-pendiente">En desarrollo</span>
                      </div>

                      <h3>{modulo.nombre}</h3>
                      <p>{modulo.descripcion}</p>

                      <div className="modulo-card-enlace">
                        Ver módulo
                        <ArrowRight size={17} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
           ) : seccion === "usuarios" && rol === "ADMINISTRADOR" ? (
           <GestionUsuarios token={sesion.token} />
           ) : seccion === "estudiantes" ? (
           <GestionEstudiantes token={sesion.token} />
           ) : (
            <div className="modulo-detalle">
              <button
                className="volver-panel"
                onClick={() => navegar("inicio")}
              >
                ← Volver al panel
              </button>

              <div className="modulo-detalle-icono">
                {moduloSeleccionado && <moduloSeleccionado.icono size={36} />}
              </div>

              <h1>{moduloSeleccionado?.nombre}</h1>
              <p>{moduloSeleccionado?.descripcion}</p>

              <div className="modulo-aviso">
                <Clock3 size={20} />
                <span>
                  Este módulo todavía está en desarrollo. Se conectará con su
                  microservicio correspondiente.
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
