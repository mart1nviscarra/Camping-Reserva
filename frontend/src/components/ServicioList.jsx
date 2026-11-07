// Formatea un número como pesos chilenos: 65000 -> $65.000
const formatoCLP = (valor) =>
    Number(valor).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

export default function ServicioList({ servicios, esAdmin, onEditar, onEliminar }) {
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
                    {esAdmin && <th>Acciones</th>}

                </tr>
            </thead>
            <tbody>
                {servicios.map((s) => (
                    <tr key={s.id}>
                        <td>{s.nombre}</td>
                        <td>{s.descripcion}</td>
                        <td>{s.capacidad} personas</td>
                        <td>{formatoCLP(s.precio)}</td>
                        <td>{s.tiene_electricidad ? "Sí" : "No"}</td>
                        <td>{s.activo ? "Activo" : "Inactivo"}</td>
                        {esAdmin && (
                            <td>
                                <button onClick={() => onEditar(s)}>Editar</button>
                                <button onClick={() => onEliminar(s)}>Eliminar</button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
