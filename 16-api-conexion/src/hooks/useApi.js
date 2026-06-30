/* ============================================================
   useApi — Hook personalizado para peticiones HTTP
   ============================================================
   Encapsula la lógica de fetch con:
   - Estados loading/error/data para operaciones GET
   - Función ejecutar() para operaciones POST/PUT/DELETE
   - AbortController para cancelación automática
   - Manejo de errores HTTP (no solo de red)
   ============================================================ */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para peticiones GET con seguimiento de estado.
 *
 * @param {string} url — URL del recurso. Si es null, no ejecuta nada.
 * @returns {{ data, loading, error, refetch }}
 *
 * Ejemplo:
 *   const { data: usuarios, loading, error } = useApi('/users');
 */
export function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ejecutarFetch = useCallback(() => {
    // Si la URL es null/no está definida, no hacemos nada
    if (!url) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    let cancelado = false;

    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        return respuesta.json();
      })
      .then((datos) => {
        if (!cancelado) setData(datos);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // Cancelación intencional
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    // Cleanup: cancela el fetch si el componente se desmonta
    // o la URL cambia antes de que la respuesta llegue
    return () => {
      cancelado = true;
      controller.abort();
    };
  }, [url]);

  useEffect(() => {
    ejecutarFetch();
  }, [ejecutarFetch]);

  return { data, loading, error, refetch: ejecutarFetch };
}

/**
 * Función para peticiones de mutación (POST, PUT, PATCH, DELETE).
 * No es un hook, se puede llamar desde event handlers.
 *
 * @param {string} url
 * @param {'POST'|'PUT'|'PATCH'|'DELETE'} metodo
 * @param {object} [cuerpo] — opcional, para POST/PUT/PATCH
 * @returns {Promise<object>} — respuesta parseada como JSON
 *
 * Ejemplo:
 *   const nuevoPost = await apiMutacion('/posts', 'POST', { title, body, userId });
 */
export async function apiMutacion(url, metodo, cuerpo = undefined) {
  const opciones = {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
  };

  if (cuerpo !== undefined) {
    opciones.body = JSON.stringify(cuerpo);
  }

  const respuesta = await fetch(url, opciones);

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
  }

  return respuesta.json();
}
