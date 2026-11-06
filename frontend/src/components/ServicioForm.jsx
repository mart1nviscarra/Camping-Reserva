import { useEffect, useState } from "react";
import { serviciosApi } from "../api/client";

const VACIO = {
    nombre: "",
    descripcion: "",
    capacidad: "",
    precio: "",
    tiene_electricidad: true,
    activo: true,
};

export default function ServicioForm({ servicio, onGuardado, onCancelar }) {
    const [form, setForm] = useState(VACIO);
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    // Si cambia el servicio seleccionado (modo edición), se precargan sus datos
    useEffect(() => {
        setForm(servicio ?? VACIO);
        setErrores({});
    }, [servicio]);

    // Un solo manejador para todos los campos: usa el atributo "name" del input
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // evita que el navegador recargue la página
        setEnviando(true);
        setErrores({});
        try {
            if (servicio) {
                await serviciosApi.actualizar(servicio.id, form);
            } else {
                await serviciosApi.crear(form);
            }
            setForm(VACIO);
            onGuardado(); // avisa a App para que recargue la lista
        } catch (err) {
            if (err.status === 400 && err.detalle) {
                setErrores(err.detalle); // errores de validación del serializer
            } else {
                setErrores({ general: ["No se pudo guardar. Intenta nuevamente."] });
            }
        } finally {
            setEnviando(false);
        }
    };

    // Muestra los mensajes de error de un campo, si existen
    const mensajes = (campo) =>
        errores[campo]?.map((m) => (
            <span key={m} className="campo-error">{m}</span>
        ));

    return (
        <form className="formulario" onSubmit={handleSubmit}>
            <h2>{servicio ? "Editar servicio" : "Nuevo servicio"}</h2>

            <label>
                Nombre
                <input name="nombre" value={form.nombre} onChange={handleChange} />
                {mensajes("nombre")}
            </label>

            <label>
                Descripción
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />
                {mensajes("descripcion")}
            </label>

            <label>
                Capacidad (personas)
                <input name="capacidad" type="number" value={form.capacidad} onChange={handleChange} />
                {mensajes("capacidad")}
            </label>

            <label>
                Precio (CLP)
                <input name="precio" type="number" value={form.precio} onChange={handleChange} />
                {mensajes("precio")}
            </label>

            <label>
                <span>
                    <input name="tiene_electricidad" type="checkbox" checked={form.tiene_electricidad} onChange={handleChange} />{" "}
                    Tiene electricidad
                </span>
            </label>

            <label>
                <span>
                    <input name="activo" type="checkbox" checked={form.activo} onChange={handleChange} />{" "}
                    Activo
                </span>
            </label>

            {mensajes("general")}

            <div>
                <button type="submit" disabled={enviando}>
                    {enviando ? "Guardando…" : "Guardar"}
                </button>
                {servicio && (
                    <button type="button" onClick={onCancelar}>Cancelar</button>
                )}
            </div>
        </form>
    );
}
