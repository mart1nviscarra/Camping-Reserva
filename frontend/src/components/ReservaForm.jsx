import { useEffect, useState } from "react";
import { reservasApi } from "../api/client";

export default function ReservaForm({ servicios, servicioId, onCreada }) {
    const [form, setForm] = useState({ servicio: "", fecha_inicio: "", fecha_fin: "" });
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    // Si el cliente presionó "Reservar" en una fila, se preselecciona
    useEffect(() => {
        if (servicioId) setForm((f) => ({ ...f, servicio: String(servicioId) }));
    }, [servicioId]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setErrores({});
        try {
            await reservasApi.crear(form);
            setForm({ servicio: "", fecha_inicio: "", fecha_fin: "" });
            onCreada();
        } catch (err) {
            if (err.status === 400 && err.detalle) setErrores(err.detalle);
            else setErrores({ general: ["No se pudo crear la reserva."] });
        } finally {
            setEnviando(false);
        }
    };

    const mensajes = (campo) =>
        errores[campo]?.map((m) => <span key={m} className="campo-error">{m}</span>);

    return (
        <form className="formulario" onSubmit={handleSubmit}>
            <h2>Nueva reserva</h2>

            <label>
                Cabaña o sitio
                <select name="servicio" value={form.servicio} onChange={handleChange}>
                    <option value="">Selecciona…</option>
                    {servicios.map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                </select>
                {mensajes("servicio")}
            </label>

            <label>
                Llegada
                <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} />
                {mensajes("fecha_inicio")}
            </label>

            <label>
                Salida
                <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} />
                {mensajes("fecha_fin")}
            </label>

            {mensajes("general")}

            <div>
                <button type="submit" disabled={enviando}>
                    {enviando ? "Reservando…" : "Reservar"}
                </button>
            </div>
        </form>
    );
} s