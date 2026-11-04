// Formatea un número como pesos chilenos: 65000 -> $65.000
// El precio llega como texto desde DRF, por eso se convierte con Number()
const formatoCLP = (valor) =>
    Number(valor).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

export default function ServicioList({ servicios }) {
    if (servicios.length === 0) {
        return <p className="aviso">Aún no hay servicios registrados.</p>;
    }

    return (
        <table className="tabla">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Capacidad</th>
                    <th>Precio</th>
                    <th>Electricidad</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                {servicios.map((s) => (
                    // key: identificador único para que React distinga cada fila
                    <tr key={s.id}>
                        <td>{s.nombre}</td>
                        <td>{s.descripcion}</td>
                        <td>{s.capacidad} personas</td>
                        <td>{formatoCLP(s.precio)}</td>
                        <td>{s.tiene_electricidad ? "Sí" : "No"}</td>
                        <td>{s.activo ? "Activo" : "Inactivo"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}