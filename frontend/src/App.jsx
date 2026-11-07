import { useCallback, useEffect, useState } from "react";
import { authApi, serviciosApi, setAlNoAutorizado, setToken } from "./api/client";
import Login from "./components/Login";
import ServicioList from "./components/ServicioList";
import ServicioForm from "./components/ServicioForm";
import "./App.css";

const leerUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
};

export default function App() {
  const [usuario, setUsuario] = useState(leerUsuario);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);
  const [editando, setEditando] = useState(null);

  const limpiarSesion = useCallback(() => {
    setToken(null);
    localStorage.removeItem("usuario");
    setUsuario(null);
    setServicios([]);
    setEditando(null);
  }, []);

  // Si el servidor responde 401, se vuelve al login
  useEffect(() => {
    setAlNoAutorizado(limpiarSesion);
  }, [limpiarSesion]);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setCargando(true);
      setServicios(await serviciosApi.listar());
    } catch (e) {
      if (e.status !== 401) {
        setError("No se pudo cargar la lista. ¿Está encendido el servidor Django?");
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (usuario) cargar();
  }, [usuario, cargar]);

  const handleLogin = (datos) => {
    setToken(datos.token);
    localStorage.setItem("usuario", JSON.stringify(datos.usuario));
    setUsuario(datos.usuario);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // aunque falle el servidor, se cierra la sesión local
    }
    limpiarSesion();
  };

  const handleGuardado = () => {
    setEditando(null);
    setErrorAccion(null);
    cargar();
  };

  const handleEliminar = async (servicio) => {
    if (!window.confirm("¿Eliminar el servicio «" + servicio.nombre + "»?")) return;
    try {
      setErrorAccion(null);
      await serviciosApi.eliminar(servicio.id);
      if (editando && editando.id === servicio.id) setEditando(null);
      cargar();
    } catch (e) {
      setErrorAccion(
        e.status === 403
          ? "No tienes permiso para eliminar servicios."
          : e.status === 404
            ? "Ese servicio ya no existe."
            : "No se pudo eliminar el servicio."
      );
    }
  };

  if (!usuario) {
    return (
      <main className="contenedor">
        <h1>Camping Reserva</h1>
        <Login onLogin={handleLogin} />
      </main>
    );
  }

  return (
    <main className="contenedor">
      <header className="barra">
        <h1>Servicios del camping</h1>
        <div>
          {usuario.username} ({usuario.es_admin ? "administrador" : "cliente"})
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      {usuario.es_admin && (
        <ServicioForm
          servicio={editando}
          onGuardado={handleGuardado}
          onCancelar={() => setEditando(null)}
        />
      )}

      {errorAccion && <p className="aviso error">{errorAccion}</p>}
      {cargando && <p className="aviso">Cargando…</p>}
      {error && <p className="aviso error">{error}</p>}
      {!cargando && !error && (
        <ServicioList
          servicios={servicios}
          esAdmin={usuario.es_admin}
          onEditar={setEditando}
          onEliminar={handleEliminar}
        />
      )}
    </main>
  );
}