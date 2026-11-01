import { useState } from "react";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
  LogOut,
} from "lucide-react";
import { iniciarSesion } from "./services/api";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [sesion, setSesion] = useState(() => {
    try {
      const guardada = sessionStorage.getItem("universidad_sesion");
      return guardada ? JSON.parse(guardada) : null;
    } catch {
      sessionStorage.removeItem("universidad_sesion");
      return null;
    }
  });

  async function manejarLogin(evento) {
    evento.preventDefault();
    setError("");
    setCargando(true);

    try {
      const datos = await iniciarSesion(correo, password);
      setSesion(datos);
      sessionStorage.setItem("universidad_sesion", JSON.stringify(datos));
      setPassword("");
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  function cerrarSesion() {
    setSesion(null);
    setCorreo("");
    setPassword("");
    setError("");
    sessionStorage.removeItem("universidad_sesion");
  }

  if (sesion) {
    return <Dashboard sesion={sesion} onCerrarSesion={cerrarSesion} />;
  }

  return (
    <main className="pantalla-login">
      <div className="resplandor resplandor-uno" />
      <div className="resplandor resplandor-dos" />

      <div className="onda onda-superior" />
      <div className="onda onda-inferior" />

      <div className="escenario-universidad" aria-hidden="true">
        <div className="edificio">
          <div className="edificio-superior" />
          <div className="edificio-nombre">UNIVERSIDAD NUEVA GENERACION</div>
          <div className="edificio-ventanas">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="edificio-entrada" />
        </div>
        <div className="suelo" />
      </div>

      <section className="tarjeta-login">
        <header className="cabecera-login">
          <div className="logo-universidad">
            <GraduationCap size={39} strokeWidth={1.9} />
          </div>

          <h1>Universidad Privada Nueva Generación</h1>
          <p>Sistema de Gestión Académica</p>
          <div className="linea-decorativa" />
        </header>

        {sesion ? (
          <div className="contenido-bienvenida">
            <div className="icono-bienvenida">
              <ShieldCheck size={42} />
            </div>

            <h2>¡Bienvenido!</h2>
            <p>Has iniciado sesión correctamente.</p>
            <p className="detalle-sesion">
              Tu acceso fue validado por el servicio de autenticación.
            </p>

            <button
              className="boton-ingresar"
              type="button"
              onClick={cerrarSesion}
            >
              <LogOut size={19} />
              Cerrar sesión
            </button>
          </div>
        ) : (
          <>
            <div className="titulo-formulario">
              <UserRound size={23} />
              <h2>Iniciar sesión</h2>
            </div>

            <form onSubmit={manejarLogin}>
              <div className="grupo-formulario">
                <label htmlFor="correo">Correo electrónico</label>

                <div className="campo-login">
                  <Mail size={20} />
                  <input
                    id="correo"
                    type="email"
                    placeholder="correo@universidad.edu"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="grupo-formulario">
                <label htmlFor="password">Contraseña</label>

                <div className="campo-login">
                  <LockKeyhole size={20} />

                  <input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    className="boton-ojo"
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    aria-label={
                      mostrarPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="mensaje-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="boton-ingresar"
                type="submit"
                disabled={cargando}
              >
                <LogIn size={21} />
                {cargando
                  ? "Verificando credenciales..."
                  : "Ingresar al sistema"}
              </button>
            </form>
          </>
        )}

        <footer className="pie-login">
          <ShieldCheck size={19} />
          <span>Acceso institucional seguro</span>
        </footer>
      </section>

      <div className="marca-inferior">
        © {new Date().getFullYear()} Universidad Privada Nueva Generación
      </div>
    </main>
  );
}

export default App;
