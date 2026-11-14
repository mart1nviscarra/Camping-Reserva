const BASE = "/api";

// App registra aquí qué hacer cuando el servidor responde 401
let alNoAutorizado = () => { };
export const setAlNoAutorizado = (fn) => { alNoAutorizado = fn; };

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) =>
    t ? localStorage.setItem("token", t) : localStorage.removeItem("token");

async function request(ruta, opciones = {}) {
    const { headers, body, sinAuth, ...resto } = opciones;
    const token = getToken();
    const esFormData = body instanceof FormData; // para subir fotos

    const respuesta = await fetch(BASE + ruta, {
        ...resto,
        body,
        headers: {
            // con FormData el navegador pone el Content-Type solo
            ...(esFormData ? {} : { "Content-Type": "application/json" }),
            ...(token && !sinAuth ? { Authorization: "Token " + token } : {}),
            ...headers,
        },
    });

    if (!respuesta.ok) {
        let detalle = null;
        try {
            detalle = await respuesta.json();
        } catch {
            // la respuesta de error no traía JSON
        }
        if (respuesta.status === 401 && token && !sinAuth) {
            alNoAutorizado(); // token inválido o vencido: volver al login
        }
        const error = new Error("Error " + respuesta.status);
        error.status = respuesta.status;
        error.detalle = detalle;
        throw error;
    }

    const texto = await respuesta.text();
    return texto ? JSON.parse(texto) : null;
}

export const authApi = {
    login: (username, password) =>
        request("/auth/login/", {
            method: "POST",
            sinAuth: true,
            body: JSON.stringify({ username, password }),
        }),
    registro: (datos) =>
        request("/auth/registro/", {
            method: "POST",
            sinAuth: true,
            body: JSON.stringify(datos),
        }),
    logout: () => request("/auth/logout/", { method: "POST" }),
};

export const serviciosApi = {
    listar: () => request("/servicios/"),
    crear: (datos) => request("/servicios/", { method: "POST", body: datos }),
    actualizar: (id, datos) =>
        request("/servicios/" + id + "/", { method: "PUT", body: datos }),
    eliminar: (id) => request("/servicios/" + id + "/", { method: "DELETE" }),
};

export const reservasApi = {
    listar: () => request("/reservas/"),
    crear: (datos) =>
        request("/reservas/", { method: "POST", body: JSON.stringify(datos) }),
    cancelar: (id) => request("/reservas/" + id + "/cancelar/", { method: "POST" }),
};

export const usuariosApi = {
    listar: () => request("/usuarios/"),
    eliminar: (id) => request("/usuarios/" + id + "/", { method: "DELETE" }),
};