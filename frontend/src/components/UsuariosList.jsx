export default function UsuarioList({ usuarios, onEliminar }) {
    if (usuarios.length === 0) {
        return <p className="aviso">No hay usuarios registrados.</p>;
    }

    return (
        <table className="tabla">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Registro</th>
                    <th>Reservas activas</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {usuarios.map((u) => (
                    <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>{u.email || "—"}</td>
                        <td>{u.es_admin ? "Administrador" : "Cliente"}</td>
                        <td>{new Date(u.date_joined).toLocaleDateString("es-CL")}</td>
                        <td>{u.total_reservas}</td>
                        <td>
                            {/* a los administradores no se les ofrece eliminar */}
                            {!u.es_admin && (
                                <button onClick={() => onEliminar(u)}>Eliminar</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}