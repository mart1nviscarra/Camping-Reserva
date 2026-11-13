export default function ReservaList({ reservas, esAdmin, onCancelar }) {
    if (reservas.length === 0) {
        return <p className="aviso">Aún no hay reservas.</p>;
    }

    return (
        <table className="tabla">
            <thead>
                <tr>
                    <th>Cabaña / sitio</th>
                    {esAdmin && <th>Cliente</th>}
                    {esAdmin && <th>Correo</th>}
                    <th>Llegada</th>
                    <th>Salida</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {reservas.map((r) => (
                    <tr key={r.id}>
                        <td>{r.servicio_nombre}</td>
                        {esAdmin && <td>{r.usuario_username}</td>}
                        {esAdmin && <td>{r.usuario_email || "—"}</td>}
                        <td>{r.fecha_inicio}</td>
                        <td>{r.fecha_fin}</td>
                        <td>{r.estado === "confirmada" ? "Confirmada" : "Cancelada"}</td>
                        <td>
                            {r.estado === "confirmada" && (
                                <button onClick={() => onCancelar(r)}>Cancelar</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}