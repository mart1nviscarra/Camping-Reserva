import { useEffect, useState } from "react";

function App() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/servicios/")
      .then((res) => {
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Si DRF tiene paginación, la lista viene en data.results
        setServicios(Array.isArray(data) ? data : data.results);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando servicios...</p>;
  if (error) return <p>Ocurrió un error: {error}</p>;

  return (
    <div>
      <h1>Servicios del camping</h1>
      <ul>
        {servicios.map((s) => (
          <li key={s.id}>
            {s.nombre} {s.capacidad && `(capacidad: ${s.capacidad})`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;