import { useCallback, useEffect, useState } from "react";
import { serviciosApi } from "./api/client";
import ServicioList from "./components/ServicioList";
import ServicioForm from "./components/ServicioForm";
import "./App.css";

export default function App() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);
  const [editando, setEditando] = useState(null); // servicio en edición o null

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setCargando(true);
      const datos = await serviciosApi.listar();
      setServicios(datos);
    } catch (e) {
      setError("No se pudo cargar la lista. ¿Está encendido el servidor Django?");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Tras crear o editar: se cierra el modo edición y se recarga la lista
  const handleGuardado = () => {
    setEditando(null);
    setErrorAccion(null);
    cargar();
  };

  const handleEliminar = async (servicio) => {
    // Confirmación antes de una acción que no se puede deshacer
    if (!window.confirm("¿Eliminar el servicio «" + servicio.nombre + "»?")) return;
    try {
      setErrorAccion(null);
      await serviciosApi.eliminar(servicio.id);
      // si se borra el que se estaba editando, se limpia el formulario
      if (editando && editando.id === servicio.id) setEditando(null);
      cargar();
    } catch (e) {
      setErrorAccion("No se pudo eliminar el servicio.");
    }
  };

  return (
    <main className="contenedor">
      <h1>Servicios del camping</h1>

      <ServicioForm
        servicio={editando}
        onGuardado={handleGuardado}
        onCancelar={() => setEditando(null)}
      />

      {errorAccion && <p className="aviso error">{errorAccion}</p>}
      {cargando && <p className="aviso">Cargando…</p>}
      {error && <p className="aviso error">{error}</p>}
      {!cargando && !error && (
        <ServicioList
          servicios={servicios}
          onEditar={setEditando}
          onEliminar={handleEliminar}
        />
      )}
    </main>
  );
}