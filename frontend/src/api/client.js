// Prefijo común de la API. Con el proxy de Vite, basta una ruta relativa.
const BASE = "/api";

// Función base: todas las peticiones pasan por aquí.
async function request(ruta, opciones = {}) {
    const { headers, ...resto } = opciones;

    const respuesta = await fetch(BASE + ruta, {
        ...resto,
        headers: { "Content-Type": "application/json", ...headers },
    });

    // fetch NO lanza error con códigos 4xx/5xx: hay que revisar respuesta.ok
    if (!respuesta.ok) {
        let detalle = null;
        try {
            detalle = await respuesta.json(); // DRF entrega los errores de validación en JSON
        } catch {
            // la respuesta de error no traía JSON: se ignora
        }
        const error = new Error("Error " + respuesta.status);
        error.status = respuesta.status;
        error.detalle = detalle; // ej.: { precio: ["El precio debe ser mayor que 0."] }
        throw error;
    }

    // DELETE responde 204 (sin cuerpo): no hay JSON que leer
    if (respuesta.status === 204) return null;
    return respuesta.json();
}

// Operaciones del recurso Servicio. Observa la barra final: Django la exige.
export const serviciosApi = {
    listar: () => request("/servicios/"),
    crear: (datos) =>
        request("/servicios/", { method: "POST", body: JSON.stringify(datos) }),
    actualizar: (id, datos) =>
        request("/servicios/" + id + "/", { method: "PUT", body: JSON.stringify(datos) }),
    eliminar: (id) => request("/servicios/" + id + "/", { method: "DELETE" }),
};