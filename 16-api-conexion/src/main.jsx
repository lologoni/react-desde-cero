/* ============================================================
   React desde 0 — Proyecto 16: Conexión con API
   Concepto: Fetch, Axios, CRUD, loading states, error handling,
             variables de entorno
   ============================================================
   Hasta ahora los datos eran mock o estáticos. En una app real
   los datos vienen de un servidor vía HTTP (API REST).

   Este módulo cubre:
   - Peticiones GET con loading/error
   - Peticiones POST (crear recursos)
   - Búsqueda con debounce + API (integración con módulo 15)
   - Variables de entorno en Vite
   - Cancelación de peticiones (AbortController)
   ============================================================ */

import { createRoot } from 'react-dom/client';
import { useState, useMemo, useDeferredValue, useId } from 'react';

import { useApi, apiMutacion } from './hooks/useApi.js';

// =============================================================
// Configuración: variables de entorno
// =============================================================
// Vite expone las variables que empiezan con VITE_ al cliente.
// Mirá el archivo .env en la raíz del proyecto.
const API_URL = import.meta.env.VITE_API_URL;

console.log('📍 API URL:', API_URL);

// =============================================================
// 1. Listado de usuarios — GET con loading y error
// =============================================================
// Este componente muestra los 3 estados posibles de una
// petición asíncrona:
//   1. LOADING: se muestra un esqueleto (skeleton)
//   2. ERROR: se muestra el mensaje + botón de reintentar
//   3. SUCCESS: se muestran los datos

function EsqueletoUsuario() {
  // Skeleton loader: simula el layout de una tarjeta
  // mientras los datos se están cargando
  return (
    <div style={{
      padding: 16, border: '1px solid #eee', borderRadius: 8,
      background: '#fafafa', marginBottom: 8, animation: 'pulse 1.5s infinite'
    }}>
      <div style={{
        width: '60%', height: 20, background: '#e0e0e0', borderRadius: 4, marginBottom: 8
      }} />
      <div style={{
        width: '40%', height: 14, background: '#e0e0e0', borderRadius: 4
      }} />
    </div>
  );
}

function ListadoUsuarios() {
  const url = `${API_URL}/users`;
  const { data: usuarios, loading, error, refetch } = useApi(url);

  return (
    <section>
      <h2>👥 Listado de usuarios (GET)</h2>
      <p style={{ fontSize: '0.85em', color: '#666' }}>
        URL: <code>{url}</code>
      </p>

      {/* Estado 1: Cargando */}
      {loading && (
        <div>
          <p style={{ color: '#888' }}>⏳ Cargando usuarios...</p>
          {Array.from({ length: 5 }).map((_, i) => (
            <EsqueletoUsuario key={i} />
          ))}
        </div>
      )}

      {/* Estado 2: Error */}
      {error && (
        <div style={{
          padding: 16, background: '#fce4e4', border: '1px solid #e74c3c',
          borderRadius: 8, marginBottom: 12
        }}>
          <p style={{ color: '#c0392b', fontWeight: 'bold' }}>❌ {error}</p>
          <button onClick={refetch}>🔄 Reintentar</button>
        </div>
      )}

      {/* Estado 3: Datos cargados */}
      {!loading && !error && usuarios && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {usuarios.map((usuario) => (
            <div key={usuario.id} style={{
              padding: 16, border: '1px solid #ddd', borderRadius: 8,
              background: 'white'
            }}>
              <h3 style={{ margin: '0 0 4px' }}>{usuario.name}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.85em' }}>
                @{usuario.username} · {usuario.email}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '0.8em', color: '#888' }}>
                🏢 {usuario.company.name} · 📍 {usuario.address.city}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// =============================================================
// 2. Crear publicación — POST con formulario
// =============================================================
// Las mutaciones (POST, PUT, DELETE) NO van en hooks porque
// se disparan por eventos del usuario (click, submit), no por
// cambios en el ciclo de vida del componente.

function CrearPublicacion() {
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorMut, setErrorMut] = useState(null);

  // useId para accesibilidad de los labels
  const tituloId = useId();
  const cuerpoId = useId();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !cuerpo.trim()) return;

    setPublicando(true);
    setErrorMut(null);
    setResultado(null);

    try {
      const respuesta = await apiMutacion(`${API_URL}/posts`, 'POST', {
        title: titulo.trim(),
        body: cuerpo.trim(),
        userId: 1,
      });
      setResultado(respuesta);
      setTitulo('');
      setCuerpo('');
    } catch (err) {
      setErrorMut(err.message);
    } finally {
      setPublicando(false);
    }
  };

  return (
    <section>
      <h2>✍️ Crear publicación (POST)</h2>
      <p style={{ fontSize: '0.85em', color: '#666' }}>
        Los datos se envían a la API. JSONPlaceholder NO persiste realmente
        (es un simulador), pero devuelve la respuesta como si lo hubiera hecho.
      </p>

      <form onSubmit={manejarSubmit} style={{
        maxWidth: 500, padding: 16, border: '1px solid #ddd', borderRadius: 8
      }}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor={tituloId} style={{ display: 'block', marginBottom: 4 }}>
            Título:
          </label>
          <input id={tituloId} value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 8 }}
            placeholder="Título de la publicación"
            disabled={publicando} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor={cuerpoId} style={{ display: 'block', marginBottom: 4 }}>
            Cuerpo:
          </label>
          <textarea id={cuerpoId} value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: 8, minHeight: 80 }}
            placeholder="Contenido de la publicación"
            disabled={publicando} />
        </div>

        <button type="submit" disabled={publicando || !titulo.trim() || !cuerpo.trim()}>
          {publicando ? '⏳ Publicando...' : '📤 Publicar'}
        </button>

        {errorMut && (
          <p style={{ color: '#c0392b', marginTop: 8 }}>❌ {errorMut}</p>
        )}

        {resultado && (
          <div style={{
            marginTop: 12, padding: 12, background: '#d4edda',
            border: '1px solid #28a745', borderRadius: 6, fontSize: '0.85em'
          }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 8px' }}>
              ✅ Publicación creada (ID: {resultado.id})
            </p>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </section>
  );
}

// =============================================================
// 3. Buscador con debounce + API
// =============================================================
// Este ejemplo integra dos conceptos de módulos anteriores:
// - useDeferredValue (módulo 15) para búsqueda responsiva
// - useMemo para evitar filtrar en cada render
// - useApi para la carga de datos desde la API
//
// PATRÓN: cargamos TODOS los posts una vez, y filtramos del
// lado del cliente con useDeferredValue + useMemo.

function BuscadorPosts() {
  const url = `${API_URL}/posts`;
  const { data: todosPosts, loading, error, refetch } = useApi(url);

  const [busqueda, setBusqueda] = useState('');
  const busquedaDiferida = useDeferredValue(busqueda);

  // El filtrado usa el valor diferido — no bloquea el input
  const postsFiltrados = useMemo(() => {
    if (!todosPosts) return [];
    if (!busquedaDiferida.trim()) return todosPosts.slice(0, 20);

    const termino = busquedaDiferida.toLowerCase();
    return todosPosts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(termino) ||
          p.body.toLowerCase().includes(termino)
      )
      .slice(0, 20);
  }, [todosPosts, busquedaDiferida]);

  const estaDesactualizado = busqueda !== busquedaDiferida;

  return (
    <section>
      <h2>🔍 Búsqueda en posts (GET + useDeferredValue)</h2>
      <p style={{ fontSize: '0.85em', color: '#666' }}>
        Cargamos {todosPosts ? todosPosts.length.toLocaleString() : '...'} posts
        de la API y los filtramos del lado del cliente.
      </p>

      {loading && <p>⏳ Cargando posts...</p>}

      {error && (
        <div style={{ padding: 12, background: '#fce4e4', borderRadius: 6, marginBottom: 12 }}>
          <p style={{ color: '#c0392b' }}>❌ {error}</p>
          <button onClick={refetch}>🔄 Reintentar</button>
        </div>
      )}

      {!loading && !error && todosPosts && (
        <>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscá en todos los posts..."
              style={{
                width: '100%', boxSizing: 'border-box', padding: 10, fontSize: '1em',
                border: `2px solid ${estaDesactualizado ? '#f39c12' : '#2ecc71'}`,
                borderRadius: 6, outline: 'none',
              }}
            />
            {estaDesactualizado && (
              <span style={{
                position: 'absolute', right: 12, top: 10, color: '#f39c12', fontWeight: 'bold'
              }}>
                ⏳ filtrando...
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.85em', color: '#888' }}>
            Mostrando {postsFiltrados.length} resultado(s)
            {busqueda && ` para "${busqueda}"`}
          </p>

          <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4 }}>
            {postsFiltrados.map((post) => (
              <div key={post.id} style={{
                padding: '10px 12px', borderBottom: '1px solid #eee',
                opacity: estaDesactualizado && busqueda ? 0.6 : 1
              }}>
                <strong style={{ fontSize: '0.9em' }}>
                  #{post.id}: {post.title}
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.85em', color: '#555' }}>
                  {post.body}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// =============================================================
// 4. Demostración de error — URL inválida
// =============================================================
// Este componente fuerza un error para mostrar cómo se ve
// el estado de error en useApi.
function DemostracionError() {
  const { data, loading, error, refetch } = useApi(`${API_URL}/ruta-inexistente`);

  return (
    <section>
      <h2>⚠️ Manejo de errores</h2>
      <p style={{ fontSize: '0.85em', color: '#666' }}>
        Este componente apunta a una ruta que NO existe en la API.
        Observá cómo el hook captura el error HTTP y permite reintentar.
      </p>

      {loading && <p>⏳ Intentando conectar...</p>}

      {error && (
        <div style={{
          padding: 16, background: '#fce4e4', border: '1px solid #e74c3c',
          borderRadius: 8
        }}>
          <p style={{ color: '#c0392b', fontWeight: 'bold', margin: '0 0 8px' }}>
            ❌ Error capturado: {error}
          </p>
          <p style={{ fontSize: '0.85em', color: '#666', margin: '0 0 8px' }}>
            El hook {`useApi`} detectó que la respuesta HTTP no fue exitosa
            (código 404) y lanzó un error con el mensaje correspondiente.
          </p>
          <button onClick={refetch}>🔄 Reintentar</button>
        </div>
      )}

      {!loading && !error && data && (
        <p>✅ Datos recibidos (no deberías ver esto)</p>
      )}
    </section>
  );
}

// =============================================================
// DEMO — Renderiza todo junto
// =============================================================
function Demo() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>🌐 Conexión con API</h1>
      <p style={{ color: '#555' }}>
        API URL: <code>{API_URL}</code>
        {' — '}
        <a href="https://jsonplaceholder.typicode.com" target="_blank" rel="noopener">
          JSONPlaceholder
        </a>
      </p>

      <hr /><ListadoUsuarios />
      <hr /><CrearPublicacion />
      <hr /><BuscadorPosts />
      <hr /><DemostracionError />
    </div>
  );
}

// =============================================================
const root = createRoot(document.getElementById('root'));
root.render(<Demo />);
