import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    fetch("/api/servicios/")
      .then((res) => res.json())
      .then((datos) => console.log("Datos recibidos:", datos))
      .catch((err) => console.error("Falló la petición:", err));
  }, []);

  return <h1>Probando la conexión…</h1>;
}