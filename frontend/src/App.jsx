import { useCallback, useEffect, useState } from "react";
import { serviciosApi } from "./api/client";
import ServicioList from "./components/ServicioList";
import ServicioForm from "./components/ServicioForm";
import "./App.css";

export default function App() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // useCallback mantiene la misma función entre renders (la usa useEffect)
  const cargar = useCallback(async () => {
    try {
      setError(null);
      setCargando(true);
      const datos = await serviciosApi.listar();
      setServicios(datos);
    } catch (e) {
      setError("No se pudo cargar la lista. ¿Está encendido el servidor Django?");
    } finally {
      setCargando(false); // se ejecuta siempre, haya éxito o error
    }
  }, []);

  // Carga inicial al montar el componente
  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <main className="contenedor">
      <h1>Servicios del camping</h1>
      <ServicioForm servicio={null} onGuardado={cargar} onCancelar={() => { }} />
      {cargando && <p className="aviso">Cargando…</p>}
      {error && <p className="aviso error">{error}</p>}
      {!cargando && !error && <ServicioList servicios={servicios} />}
    </main>
  );
}