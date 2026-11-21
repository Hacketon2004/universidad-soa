import { useState, useEffect, useRef, useMemo, useId } from "react";
import { X } from "lucide-react";
import "./SelectorBuscable.css";

function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function SelectorBuscable({
  id,
  opciones = [],
  valor = "",
  onChange,
  placeholder = "",
  deshabilitado = false,
  vacio = "Sin resultados",
}) {
  const reactId = useId();
  const inputId = id || reactId;

  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(false);
  const [indiceResaltado, setIndiceResaltado] = useState(-1);

  const contenedorRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);

  const opcionSeleccionada = useMemo(() => {
    if (valor === undefined || valor === null || valor === "") return null;
    return opciones.find((op) => String(op.valor) === String(valor)) || null;
  }, [opciones, valor]);

  const opcionesFiltradas = useMemo(() => {
    const query = normalizarTexto(busqueda.trim());
    if (!query) {
      return opciones.slice(0, 50);
    }
    return opciones
      .filter((op) => {
        const textoFiltro = `${op.valor ?? ""} ${op.titulo ?? ""} ${op.detalle ?? ""}`;
        return normalizarTexto(textoFiltro).includes(query);
      })
      .slice(0, 50);
  }, [opciones, busqueda]);

  // Cerrar la lista al hacer clic fuera
  useEffect(() => {
    function manejarClickFuera(evento) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target)
      ) {
        setAbierto(false);
        setEditando(false);
        setBusqueda("");
        setIndiceResaltado(-1);
      }
    }

    document.addEventListener("mousedown", manejarClickFuera);
    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, []);

  // Mantener visible en el scroll la opción resaltada
  useEffect(() => {
    if (abierto && indiceResaltado >= 0 && listaRef.current) {
      const elemento = listaRef.current.children[indiceResaltado];
      if (elemento && typeof elemento.scrollIntoView === "function") {
        elemento.scrollIntoView({ block: "nearest" });
      }
    }
  }, [indiceResaltado, abierto]);

  function seleccionarOpcion(opcion) {
    if (!opcion || deshabilitado) return;
    onChange?.(opcion.valor);
    setAbierto(false);
    setEditando(false);
    setBusqueda("");
    setIndiceResaltado(-1);
  }

  function limpiar(evento) {
    evento.stopPropagation();
    onChange?.("");
    setEditando(false);
    setBusqueda("");
    setIndiceResaltado(-1);
    setAbierto(false);
    inputRef.current?.focus();
  }

  function manejarClickInput() {
    if (deshabilitado) return;
    setAbierto(true);
    if (indiceResaltado === -1 && opcionesFiltradas.length > 0) {
      setIndiceResaltado(0);
    }
  }

  function manejarFocusInput() {
    if (deshabilitado) return;
    setAbierto(true);
  }

  function manejarChangeInput(evento) {
    setEditando(true);
    setBusqueda(evento.target.value);
    setAbierto(true);
    setIndiceResaltado(0);
  }

  function manejarKeyDown(evento) {
    if (deshabilitado) return;

    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      if (!abierto) {
        setAbierto(true);
        setIndiceResaltado(0);
      } else if (opcionesFiltradas.length > 0) {
        setIndiceResaltado((anterior) =>
          anterior < opcionesFiltradas.length - 1 ? anterior + 1 : 0
        );
      }
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      if (!abierto) {
        setAbierto(true);
        setIndiceResaltado(opcionesFiltradas.length - 1);
      } else if (opcionesFiltradas.length > 0) {
        setIndiceResaltado((anterior) =>
          anterior > 0 ? anterior - 1 : opcionesFiltradas.length - 1
        );
      }
    } else if (evento.key === "Enter") {
      if (
        abierto &&
        indiceResaltado >= 0 &&
        indiceResaltado < opcionesFiltradas.length
      ) {
        evento.preventDefault();
        seleccionarOpcion(opcionesFiltradas[indiceResaltado]);
      }
    } else if (evento.key === "Escape") {
      if (abierto) {
        evento.preventDefault();
        setAbierto(false);
        setEditando(false);
        setBusqueda("");
        setIndiceResaltado(-1);
      }
    } else if (evento.key === "Tab") {
      setAbierto(false);
      setEditando(false);
      setBusqueda("");
      setIndiceResaltado(-1);
    }
  }

  const valorMostrado = editando
    ? busqueda
    : opcionSeleccionada
    ? opcionSeleccionada.titulo
    : valor
    ? String(valor)
    : "";

  const hayValorSeleccionado = Boolean(
    valor !== undefined && valor !== null && valor !== ""
  );

  return (
    <div
      ref={contenedorRef}
      className={`selector-buscable ${abierto ? "abierto" : ""} ${
        deshabilitado ? "deshabilitado" : ""
      }`}
    >
      <div className="selector-buscable-control">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={`${inputId}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={
            abierto &&
            indiceResaltado >= 0 &&
            opcionesFiltradas[indiceResaltado]
              ? `${inputId}-opcion-${indiceResaltado}`
              : undefined
          }
          autoComplete="off"
          disabled={deshabilitado}
          placeholder={placeholder}
          value={valorMostrado}
          onClick={manejarClickInput}
          onFocus={manejarFocusInput}
          onChange={manejarChangeInput}
          onKeyDown={manejarKeyDown}
        />

        {hayValorSeleccionado && !deshabilitado && (
          <button
            type="button"
            className="selector-buscable-limpiar"
            onClick={limpiar}
            aria-label="Limpiar selección"
            title="Limpiar"
            tabIndex={-1}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {abierto && !deshabilitado && (
        <ul
          ref={listaRef}
          id={`${inputId}-lista`}
          role="listbox"
          className="selector-buscable-lista"
        >
          {opcionesFiltradas.length > 0 ? (
            opcionesFiltradas.map((opcion, index) => {
              const estaSeleccionado = String(opcion.valor) === String(valor);
              const estaResaltado = index === indiceResaltado;

              return (
                <li
                  key={`${opcion.valor}-${index}`}
                  id={`${inputId}-opcion-${index}`}
                  role="option"
                  aria-selected={estaSeleccionado}
                  className={`selector-buscable-opcion ${
                    estaResaltado ? "resaltado" : ""
                  } ${estaSeleccionado ? "seleccionado" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={() => seleccionarOpcion(opcion)}
                  onMouseEnter={() => setIndiceResaltado(index)}
                >
                  <span className="selector-buscable-opcion-titulo">
                    {opcion.titulo}
                  </span>
                  {opcion.detalle && (
                    <span className="selector-buscable-opcion-detalle">
                      {opcion.detalle}
                    </span>
                  )}
                </li>
              );
            })
          ) : (
            <li className="selector-buscable-vacio" role="status">
              {vacio}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
