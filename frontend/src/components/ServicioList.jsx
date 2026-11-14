const formatoCLP = (valor) =>
    Number(valor).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

export default function ServicioList({ servicios, esAdmin, onEditar, onEliminar, onReservar }) {
    if (servicios.length === 0) {
        return <p className="aviso">No hay servicios disponibles por ahora.</p>;
    }

    return (
        <table className="tabla">
            <thead>
                <tr>
                    <th>Foto</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Capacidad</th>
                    <th>Precio</th>
                    <th>Electricidad</th>
                    {esAdmin && <th>Estado</th>}
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {servicios.map((s) => (
                    <tr key={s.id}>
                        <td>
                            {s.foto ? (
                                <img src={s.foto} alt={s.nombre} style={{ width: 90, height: 60, objectFit: "cover", borderRadius: 4 }} />
                            ) : (
                                "—"
                            )}
                        </td>
                        <td>{s.nombre}</td>
                        <td>{s.descripcion}</td>
                        <td>{s.capacidad} personas</td>
                        <td>{formatoCLP(s.precio)}</td>
                        <td>{s.tiene_electricidad ? "Sí" : "No"}</td>
                        {esAdmin && <td>{s.activo ? "Activo" : "Inactivo"}</td>}
                        <td>
                            {esAdmin ? (
                                <>
                                    <button onClick={() => onEditar(s)}>Editar</button>
                                    <button onClick={() => onEliminar(s)}>Eliminar</button>
                                </>
                            ) : (
                                <button onClick={() => onReservar(s)}>Reservar</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}