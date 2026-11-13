import { useCallback, useEffect, useState } from "react";
import {
  authApi, serviciosApi, reservasApi, usuariosApi,
  setAlNoAutorizado, setToken,
} from "./api/client";
import Login from "./components/Login";
import ServicioList from "./components/ServicioList";
import ServicioForm from "./components/ServicioForm";
import ReservaForm from "./components/ReservaForm";
import ReservaList from "./components/ReservaList";
import UsuarioList from "./components/UsuariosList";
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
  const [vista, setVista] = useState("servicios"); // servicios | reservas | usuarios
  const [servicios, setServicios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);
  const [editando, setEditando] = useState(null);
  const [servicioAReservar, setServicioAReservar] = useState(null);

  const limpiarSesion = useCallback(() => {
    setToken(null);
    localStorage.removeItem("usuario");
    setUsuario(null);
    setServicios([]);
    setReservas([]);
    setUsuarios([]);
    setEditando(null);
    setVista("servicios");
  }, []);

  useEffect(() => {
    setAlNoAutorizado(limpiarSesion);
  }, [limpiarSesion]);

  // Carga todo lo que el rol puede ver
  const cargar = useCallback(async () => {
    try {
      setError(null);
      setCargando(true);
      setServicios(await serviciosApi.listar());
      setReservas(await reservasApi.listar());
      if (usuario?.es_admin) setUsuarios(await usuariosApi.listar());
    } catch (e) {
      if (e.status !== 401) {
        setError("No se pudo cargar la información. ¿Está encendido el servidor Django?");
      }
    } finally {
      setCargando(false);
    }
  }, [usuario]);

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
        e.status === 409 ? e.detalle?.detail
          : e.status === 403 ? "No tienes permiso para eliminar servicios."
            : e.status === 404 ? "Ese servicio ya no existe."
              : "No se pudo eliminar el servicio."
      );
    }
  };

  const handleReservar = (servicio) => {
    setServicioAReservar(servicio.id);
    setVista("reservas");
  };

  const handleReservaCreada = () => {
    setServicioAReservar(null);
    setErrorAccion(null);
    cargar();
  };

  const handleCancelar = async (reserva) => {
    if (!window.confirm("¿Cancelar la reserva de «" + reserva.servicio_nombre + "»?")) return;
    try {
      setErrorAccion(null);
      await reservasApi.cancelar(reserva.id);
      cargar();
    } catch (e) {
      setErrorAccion(
        e.status === 404 ? "Esa reserva no existe." : "No se pudo cancelar la reserva."
      );
    }
  };
  const handleEliminarUsuario = async (u) => {
    if (
      !window.confirm(
        "¿Eliminar al usuario «" + u.username + "»? También se borrarán todas sus reservas."
      )
    )
      return;
    try {
      setErrorAccion(null);
      await usuariosApi.eliminar(u.id);
      cargar();
    } catch (e) {
      setErrorAccion(
        e.detalle?.detail ||
        (e.status === 404 ? "Ese usuario ya no existe." : "No se pudo eliminar el usuario.")
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

  const pestana = (id, texto) => (
    <button
      className={"pestana" + (vista === id ? " activa" : "")}
      onClick={() => setVista(id)}
    >
      {texto}
    </button>
  );

  return (
    <main className="contenedor">
      <header className="barra">
        <h1>Camping Reserva</h1>
        <div>
          {usuario.username} ({usuario.es_admin ? "administrador" : "cliente"})
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <nav className="pestanas">
        {pestana("servicios", usuario.es_admin ? "Servicios" : "Cabañas disponibles")}
        {pestana("reservas", usuario.es_admin ? "Todas las reservas" : "Mis reservas")}
        {usuario.es_admin && pestana("usuarios", "Usuarios registrados")}
      </nav>

      {errorAccion && <p className="aviso error">{errorAccion}</p>}
      {cargando && <p className="aviso">Cargando…</p>}
      {error && <p className="aviso error">{error}</p>}

      {!cargando && !error && vista === "servicios" && (
        <>
          {usuario.es_admin && (
            <ServicioForm
              servicio={editando}
              onGuardado={handleGuardado}
              onCancelar={() => setEditando(null)}
            />
          )}
          <ServicioList
            servicios={servicios}
            esAdmin={usuario.es_admin}
            onEditar={setEditando}
            onEliminar={handleEliminar}
            onReservar={handleReservar}
          />
        </>
      )}

      {!cargando && !error && vista === "reservas" && (
        <>
          {!usuario.es_admin && (
            <ReservaForm
              servicios={servicios}
              servicioId={servicioAReservar}
              onCreada={handleReservaCreada}
            />
          )}
          <ReservaList
            reservas={reservas}
            esAdmin={usuario.es_admin}
            onCancelar={handleCancelar}
          />
        </>
      )}

      {!cargando && !error && vista === "usuarios" && usuario.es_admin && (
        <UsuarioList usuarios={usuarios} onEliminar={handleEliminarUsuario} />
      )}
    </main>
  );

}