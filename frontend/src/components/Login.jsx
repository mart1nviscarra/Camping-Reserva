import { useState } from "react";
import { authApi } from "../api/client";

export default function Login({ onLogin }) {
    const [modo, setModo] = useState("login"); // "login" o "registro"
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setErrores({});
        try {
            if (modo === "registro") await authApi.registro(form);
            const datos = await authApi.login(form.username, form.password);
            onLogin(datos);
        } catch (err) {
            if (err.status === 400 && err.detalle) {
                // login devuelve {detail}; registro devuelve errores por campo
                setErrores(err.detalle.detail ? { general: [err.detalle.detail] } : err.detalle);
            } else {
                setErrores({ general: ["No se pudo conectar con el servidor."] });
            }
        } finally {
            setEnviando(false);
        }
    };

    const mensajes = (campo) =>
        errores[campo]?.map((m) => (
            <span key={m} className="campo-error">{m}</span>
        ));

    return (
        <form className="formulario" onSubmit={handleSubmit}>
            <h2>{modo === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>

            <label>
                Usuario
                <input name="username" value={form.username} onChange={handleChange} />
                {mensajes("username")}
            </label>

            {modo === "registro" && (
                <label>
                    Correo
                    <input name="email" type="email" value={form.email} onChange={handleChange} />
                    {mensajes("email")}
                </label>
            )}

            <label>
                Contraseña
                <input name="password" type="password" value={form.password} onChange={handleChange} />
                {mensajes("password")}
            </label>

            {mensajes("general")}

            <div>
                <button type="submit" disabled={enviando}>
                    {enviando ? "Enviando…" : modo === "login" ? "Entrar" : "Registrarme"}
                </button>
                <button type="button" onClick={() => { setModo(modo === "login" ? "registro" : "login"); setErrores({}); }}>
                    {modo === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
                </button>
            </div>
        </form>
    );
}