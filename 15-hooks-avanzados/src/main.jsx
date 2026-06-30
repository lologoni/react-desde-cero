/* ============================================================
   React desde 0 — Proyecto 15: Hooks Avanzados
   Concepto: useReducer, useCallback, useMemo, useId,
             useTransition, useDeferredValue
   ============================================================
   Estos hooks resuelven problemas específicos que SOLO
   hooks básicos (useState, useEffect) no pueden:
   - Estado complejo con acciones (useReducer)
   - Funciones estables entre renders (useCallback)
   - Cómputos costosos memoizados (useMemo)
   - IDs únicos para accesibilidad/SSR (useId)
   - Updates no urgentes que no bloquean la UI (useTransition)
   - Valores que pueden ir detrás del input (useDeferredValue)
   ============================================================ */

import { createRoot } from 'react-dom/client';
import {
  useReducer, useCallback, useMemo, useId,
  useTransition, useDeferredValue,
  useState, memo, useRef
} from 'react';

// =============================================================
// 1. useReducer — Estado complejo con acciones
// =============================================================
// PROBLEMA: useState se vuelve un quilombo cuando tenés
// múltiples campos que dependen entre sí, o acciones complejas
// como "toggle", "reset", "bulkUpdate".
//
// SOLUCIÓN: useReducer centraliza TODA la lógica de
// actualización en una función reductora PURA (sin efectos
// secundarios). La función recibe el estado actual y una
// acción, y devuelve el NUEVO estado.
//
//   reducer(state, action) -> newState
//
// La acción es un objeto con { type, payload }.
// Las acciones se "disparan" con dispatch({ type, payload }).
//
// VENTAJA: la lógica de estado es testeable, predecible
// y vive FUERA del componente.

// --- Reducer ---
const initialState = { count: 0, history: [] };

function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1, history: [...state.history, state.count + 1] };
    case 'DECREMENT':
      return { count: state.count - 1, history: [...state.history, state.count - 1] };
    case 'RESET':
      return initialState;
    case 'SET':
      return { count: action.payload, history: [...state.history, action.payload] };
    default:
      return state;
  }
}

// --- Componente ---
function ContadorReducer() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <section>
      <h2>🔁 useReducer</h2>
      <p><strong>Estado:</strong> {JSON.stringify(state)}</p>
      <p><strong>Count:</strong> {state.count}</p>
      <p><strong>Historial:</strong> [{state.history.join(', ')}]</p>

      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+1</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-1</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'SET', payload: 100 })}>Poner en 100</button>

      <details>
        <summary>🧪 ¿Qué pasa si mandamos una acción inválida?</summary>
        <p>El reducer tiene un <code>default</code> que devuelve el estado sin cambios. Probá:</p>
        <button onClick={() => dispatch({ type: 'NO_EXISTE' })}>
          Mandar acción inválida
        </button>
        <p style={{ color: '#666', fontSize: '0.85em' }}>
          (No pasa nada — el default captura todo lo que no está definido)
        </p>
      </details>
    </section>
  );
}

// =============================================================
// 2. useCallback — Referencias estables a funciones
// =============================================================
// PROBLEMA: cada vez que un componente se renderiza, todas las
// funciones definidas adentro se CREAN DE NUEVO. Si pasás esas
// funciones a componentes hijos envueltos en React.memo, el
// memo NO FUNCIONA porque la referencia de la función cambió.
//
// SOLUCIÓN: useCallback guarda la misma referencia de función
// entre renders, y SOLO la cambia cuando sus dependencias cambian.
//
// useCallback(fn, [deps])  ===  useMemo(() => fn, [deps])
// Es azúcar sintáctica para memorizar funciones.
//
// REGLA DE ORO:
//   useCallback + React.memo = evita renders innecesarios en hijos
//   useCallback SIN React.memo = no sirve para NADA

// --- Helper para generar items ---
function generarItems(cantidad) {
  return Array.from({ length: cantidad }, (_, i) => ({
    id: i,
    texto: `Item ${i + 1}`,
    activo: false,
  }));
}

// --- Componente hijo memoizado ---
// React.memo evita que el componente se re-renderice si sus
// props NO cambiaron (comparación por referencia).
const ItemDemo = memo(function ItemDemo({ item, onToggle, label }) {
  // useRef cuenta renders SIN causar re-render
  const renders = useRef(0);
  renders.current += 1;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '4px 8px', borderBottom: '1px solid #ddd'
    }}>
      <span>{item.texto}</span>
      <button onClick={() => onToggle(item.id)}>
        {item.activo ? '✅' : '⬜'}
      </button>
      <span style={{ fontSize: '0.75em', color: '#999' }}>
        renders: {renders.current}
      </span>
    </div>
  );
});

// --- Componente padre con comparación ---
function ComparacionUseCallback() {
  const [contador, setContador] = useState(0);
  const [items, setItems] = useState(() => generarItems(10));

  // SIN useCallback: se crea una NUEVA función CADA render
  const toggleSinCallback = (id) => {
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, activo: !it.activo } : it
    ));
  };

  // CON useCallback: la MISMA función entre renders (deps vacío)
  const toggleConCallback = useCallback((id) => {
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, activo: !it.activo } : it
    ));
  }, []);

  return (
    <section>
      <h2>⚡ useCallback + memo</h2>
      <p style={{ fontSize: '0.9em', color: '#555' }}>
        Hacé click en "Contador" y fijate los contadores de renders en cada columna
      </p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h3 style={{ color: '#c0392b' }}>❌ Sin useCallback</h3>
          <p>
            <button onClick={() => setContador(c => c + 1)}>
              Contador: {contador}
            </button>
            <span style={{ marginLeft: 8, fontSize: '0.8em', color: '#888' }}>
              (causa re-render del padre)
            </span>
          </p>
          {items.map(it => (
            <ItemDemo key={it.id} item={it} onToggle={toggleSinCallback} label="sin" />
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 280 }}>
          <h3 style={{ color: '#27ae60' }}>✅ Con useCallback</h3>
          <p>
            <button onClick={() => setContador(c => c + 1)}>
              Contador: {contador}
            </button>
            <span style={{ marginLeft: 8, fontSize: '0.8em', color: '#888' }}>
              (NO afecta a los items)
            </span>
          </p>
          {items.map(it => (
            <ItemDemo key={it.id} item={it} onToggle={toggleConCallback} label="con" />
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.85em', color: '#666', marginTop: 16 }}>
        💡 Tip: cuando apretás "Contador", el padre se re-renderiza.
        A la izquierda TODOS los items se re-renderizan (memo no funciona
        porque <code>toggleSinCallback</code> es una función nueva cada vez).
        A la derecha NINGÚN item se re-renderiza porque
        <code>toggleConCallback</code> es la MISMA referencia.
      </p>
    </section>
  );
}

// =============================================================
// 3. useMemo — Valores computados memoizados
// =============================================================
// PROBLEMA: cada render ejecuta TODO el código del componente.
// Si tenés un filtro, ordenamiento o transformación costosa
// (ej: 10,000 items, anidación de arrays, cálculos pesados),
// se va a re-ejecutar aunque los datos no hayan cambiado.
//
// SOLUCIÓN: useMemo cachea el RESULTADO de una función y solo
// lo recalcula cuando sus dependencias cambian.
//
// DIFERENCIA CLAVE:
//   useCallback(fn, deps) -> memoriza la FUNCIÓN
//   useMemo(() => fn(), deps) -> memoriza el VALOR

// --- Datos mock: 20,000 productos ---
const CATEGORIAS = ['Electrónica', 'Ropa', 'Libros', 'Hogar', 'Deportes'];

function generarProductos(cantidad) {
  const resultado = [];
  for (let i = 0; i < cantidad; i++) {
    resultado.push({
      id: i,
      nombre: `Producto ${i + 1}`,
      categoria: CATEGORIAS[i % CATEGORIAS.length],
      precio: Math.round(Math.random() * 1000 + 10),
      stock: Math.random() > 0.3,
    });
  }
  return resultado;
}

const PRODUCTOS = generarProductos(20000);

// --- Componente ---
function BuscadorMemoizado() {
  const [categoria, setCategoria] = useState('Todas');
  const [soloStock, setSoloStock] = useState(false);
  const [contador, setContador] = useState(0);

  // SIN useMemo: se ejecuta CADA render (incluso al apretar contador)
  // CON useMemo: solo se ejecuta cuando categoria o soloStock cambian
  const productosFiltrados = useMemo(() => {
    console.time('filtro productos');
    let filtrados = PRODUCTOS;

    if (categoria !== 'Todas') {
      filtrados = filtrados.filter(p => p.categoria === categoria);
    }
    if (soloStock) {
      filtrados = filtrados.filter(p => p.stock);
    }

    const tiempo = performance.now().toFixed(2);
    console.timeEnd('filtro productos');
    return { data: filtrados, tiempoMs: tiempo };
  }, [categoria, soloStock]);

  return (
    <section>
      <h2>🧮 useMemo</h2>
      <p style={{ fontSize: '0.9em', color: '#555' }}>
        Filtrando entre {PRODUCTOS.length.toLocaleString()} productos
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={categoria} onChange={e => setCategoria(e.target.value)}>
          <option value="Todas">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>
          <input type="checkbox" checked={soloStock}
            onChange={e => setSoloStock(e.target.checked)} />
          {' '}Solo en stock
        </label>

        <button onClick={() => setContador(c => c + 1)}>
          🔄 Re-render forzado: {contador}
        </button>
      </div>

      <div style={{
        background: '#f0f0f0', padding: '8px 12px', borderRadius: 6,
        marginTop: 8, fontSize: '0.85em'
      }}>
        ⏱️ Tiempo de filtrado: <strong>{productosFiltrados.tiempoMs}ms</strong>
        {' — '}Resultados: <strong>{productosFiltrados.data.length}</strong>
      </div>

      <p style={{ fontSize: '0.85em', color: '#666' }}>
        💡 Apretá "Re-render forzado" — el filtrado NO se repite porque
        las dependencias (categoría, soloStock) no cambiaron. Sin useMemo,
        se filtrarían 20,000 productos CADA VEZ.
      </p>

      {/* Mostramos solo los primeros 20 resultados */}
      <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4, padding: 8, marginTop: 8 }}>
        {productosFiltrados.data.slice(0, 20).map(p => (
          <div key={p.id} style={{ fontSize: '0.85em', padding: '2px 0' }}>
            {p.nombre} — 💰 ${p.precio} — 📁 {p.categoria}
            {p.stock ? ' ✅ Stock' : ' ❌ Sin stock'}
          </div>
        ))}
        {productosFiltrados.data.length > 20 && (
          <p style={{ color: '#888', fontSize: '0.8em' }}>
            ... y {productosFiltrados.data.length - 20} más
          </p>
        )}
      </div>
    </section>
  );
}

// =============================================================
// 4. useId — IDs únicos para accesibilidad
// =============================================================
// PROBLEMA: necesitás IDs únicos para conectar labels con inputs
// (htmlFor / id). Si usás IDs hardcodeadas y el mismo componente
// se renderiza dos veces, las IDs COLISIONAN. En SSR (server-side
// rendering), los IDs del servidor y el cliente pueden no coincidir
// causando errores de hidratación.
//
// SOLUCIÓN: useId genera IDs únicos, estables y consistentes
// entre servidor y cliente. Cada instancia del componente obtiene
// IDs diferentes.

function FormularioRegistro() {
  const nombreId = useId();
  const emailId = useId();
  const passwordId = useId();

  return (
    <form onSubmit={e => { e.preventDefault(); alert('Formulario enviado (demo)'); }}
      style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, maxWidth: 400 }}>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor={nombreId} style={{ display: 'block', marginBottom: 4 }}>
          Nombre:
        </label>
        <input id={nombreId} type="text" placeholder="Tu nombre"
          style={{ width: '100%', boxSizing: 'border-box', padding: 6 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor={emailId} style={{ display: 'block', marginBottom: 4 }}>
          Email:
        </label>
        <input id={emailId} type="email" placeholder="tu@email.com"
          style={{ width: '100%', boxSizing: 'border-box', padding: 6 }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor={passwordId} style={{ display: 'block', marginBottom: 4 }}>
          Contraseña:
        </label>
        <input id={passwordId} type="password" placeholder="••••••••"
          style={{ width: '100%', boxSizing: 'border-box', padding: 6 }} />
      </div>

      <button type="submit">Registrarse (demo)</button>

      <details style={{ marginTop: 8 }}>
        <summary>🔍 Ver IDs generados</summary>
        <pre style={{ fontSize: '0.8em', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
nombreId:   &quot;{nombreId}&quot;
emailId:    &quot;{emailId}&quot;
passwordId: &quot;{passwordId}&quot;
        </pre>
        <p style={{ fontSize: '0.8em', color: '#666' }}>
          Fijate que cada ID es único. Si hubiera dos formularios en la
          página, los IDs del segundo serían diferentes a los del primero.
        </p>
      </details>
    </form>
  );
}

function DemoSinUseId() {
  // Esto es lo que la gente hace SIN useId — y está MAL
  // porque si este componente se renderiza dos veces, los IDs
  // colisionan (dos inputs con el mismo id="nombre").
  return (
    <div style={{ border: '1px solid #e74c3c', padding: 16, borderRadius: 8, maxWidth: 400 }}>
      <h4 style={{ color: '#e74c3c', margin: '0 0 8px' }}>❌ Sin useId (mal)</h4>
      <div style={{ marginBottom: 8 }}>
        <label htmlFor="nombre">Nombre:</label>
        <input id="nombre" type="text" />
      </div>
      <p style={{ fontSize: '0.8em', color: '#c0392b' }}>
        ⚠️ Si ponés este formulario dos veces, dos inputs van a tener
        <code>id="nombre"</code>. El label del primero apunta al input del segundo.
        Accesibilidad rota.
      </p>
    </div>
  );
}

function DemoFormularios() {
  return (
    <section>
      <h2>🆔 useId</h2>
      <p style={{ fontSize: '0.9em', color: '#555' }}>
        Dos formularios idénticos — cada input tiene un ID ÚNICO gracias a useId
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <FormularioRegistro />
        <FormularioRegistro /> {/* Misma instancia, IDs diferentes! */}
      </div>

      <details style={{ marginTop: 12 }}>
        <summary>🔬 Inspeccionar en el DOM</summary>
        <p style={{ fontSize: '0.85em', color: '#555' }}>
          Abrí las DevTools (F12) → Elements y fijate que cada input tiene
          un <code>id</code> diferente. El primer formulario tiene IDs como
          <code>:R1:</code>, el segundo <code>:R3:</code>. React garantiza
          que son únicos en toda la página.
        </p>
      </details>
    </section>
  );
}

// =============================================================
// 5. useTransition — Actualizaciones no urgentes
// =============================================================
// PROBLEMA: algunas actualizaciones de estado son lentas (ej:
// renderizar 50,000 items al cambiar de pestaña). Sin useTransition,
// la UI se congela hasta que React termina de renderizar.
//
// SOLUCIÓN: useTransition permite marcar una actualización como
// "no urgente". React la va a hacer en segundo plano, mostrando
// un indicador de carga mientras tanto. El usuario puede seguir
// interactuando con la UI durante la transición.
//
//   const [isPending, startTransition] = useTransition();
//   startTransition(() => {
//     setState(nuevoValor); // esto es "no urgente"
//   });
//
// isPending: true mientras la transición no termina.

function generarItemsLentos(cantidad) {
  const items = [];
  for (let i = 0; i < cantidad; i++) {
    items.push({
      id: i,
      texto: `Elemento pesado #${i}`,
      // Cada item tiene datos extra para hacer el render más costoso
      descripcion: 'Descripción larga que simula contenido real '.repeat(3).trim(),
      tags: ['demo', 'transición', 'render', 'react'].sort(() => Math.random() - 0.5),
    });
  }
  return items;
}

const ITEMS_PESADOS = generarItemsLentos(30000);

function PanelLento() {
  return (
    <div>
      <h4>🐢 Panel Pesado ({ITEMS_PESADOS.length.toLocaleString()} items)</h4>
      <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4 }}>
        {ITEMS_PESADOS.map(item => (
          <div key={item.id} style={{
            padding: '6px 10px', borderBottom: '1px solid #eee',
            fontSize: '0.85em'
          }}>
            <strong>{item.texto}</strong>
            <p style={{ margin: '2px 0', color: '#666', fontSize: '0.9em' }}>
              {item.descripcion}
            </p>
            <div style={{ display: 'flex', gap: 4 }}>
              {item.tags.map((t, i) => (
                <span key={i} style={{
                  background: '#eef', padding: '1px 6px', borderRadius: 4,
                  fontSize: '0.8em'
                }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelRapido() {
  return (
    <div>
      <h4>⚡ Panel Rápido</h4>
      <p>Este panel se renderiza al instante.</p>
      <p>Hacé click entre pestañas y fijate la diferencia:</p>
      <ul>
        <li><strong>Sin transición:</strong> la UI se congela al cambiar a "Pesado"</li>
        <li><strong>Con transición:</strong> ves "Cargando..." y la UI sigue respondiendo</li>
      </ul>
    </div>
  );
}

const TABS = ['Rápido', 'Pesado'];

function PanelTransicion() {
  const [tab, setTab] = useState('Rápido');
  const [usarTransicion, setUsarTransicion] = useState(true);
  const [isPending, startTransition] = useTransition();

  const cambiarTab = (nuevoTab) => {
    if (usarTransicion) {
      startTransition(() => setTab(nuevoTab));
    } else {
      setTab(nuevoTab); // Directo — bloquea la UI
    }
  };

  return (
    <section>
      <h2>🔄 useTransition</h2>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <input type="checkbox" checked={usarTransicion}
          onChange={e => setUsarTransicion(e.target.checked)} />
        Usar <code>useTransition</code> (desactivar para sentir el freeze)
      </label>

      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => cambiarTab(t)}
            style={{
              padding: '8px 16px',
              background: tab === t ? '#3498db' : '#ecf0f1',
              color: tab === t ? 'white' : '#333',
              border: '1px solid #bdc3c7',
              borderRadius: 4,
              cursor: 'pointer',
            }}>
            {t}
          </button>
        ))}
      </div>

      {isPending && (
        <div style={{
          padding: '8px 16px', background: '#fff3cd', border: '1px solid #ffc107',
          borderRadius: 4, marginBottom: 12, fontWeight: 'bold'
        }}>
          ⏳ Cargando...
        </div>
      )}

      {tab === 'Rápido' && <PanelRapido />}
      {tab === 'Pesado' && <PanelLento />}

      <p style={{ fontSize: '0.85em', color: '#666', marginTop: 16 }}>
        💡 Desactivá el checkbox y cambiate a "Pesado" — la UI se congela
        momentáneamente. Activá el checkbox y hace lo mismo — ves "Cargando..."
        y la UI sigue respondiendo.
      </p>
    </section>
  );
}

// =============================================================
// 6. useDeferredValue — Valor diferido
// =============================================================
// PROBLEMA: cuando el usuario escribe en un input de búsqueda
// y la lista de resultados es MUY grande, cada tecla hace que
// React filtre la lista completa. El input se siente lento.
//
// SOLUCIÓN: useDeferredValue devuelve una copia "diferida" del
// valor. El valor original (la tecla que el usuario tipeó) se
// actualiza INMEDIATAMENTE (input responsivo). El valor diferido
// se actualiza DESPUÉS, cuando React tiene tiempo.
//
// DIFERENCIA CON useTransition:
//   - useTransition: envolvés la actualización de estado
//   - useDeferredValue: envolvés el VALOR (para cuando no tenés
//     control directo sobre el setter, ej: estado viene de un hook)

const PRODUCTOS_BUSQUEDA = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  nombre: `Producto ${i + 1}`,
  descripcion: [
    'Inalámbrico', 'Recargable', 'Portátil', 'Profesional',
    'Económico', 'Premium', 'Ultra-ligero', 'Ergonómico'
  ][i % 8],
  precio: Math.round(Math.random() * 500 + 50),
  categoria: CATEGORIAS[i % CATEGORIAS.length],
}));

function BusquedaDiferida() {
  const [busqueda, setBusqueda] = useState('');
  const busquedaDiferida = useDeferredValue(busqueda);

  // El filtrado usa el valor DIFERIDO (no el del input)
  const resultados = useMemo(() => {
    console.log('🔄 Filtrando con:', busquedaDiferida);
    if (!busquedaDiferida.trim()) return [];

    return PRODUCTOS_BUSQUEDA.filter(p =>
      p.nombre.toLowerCase().includes(busquedaDiferida.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busquedaDiferida.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busquedaDiferida.toLowerCase())
    );
  }, [busquedaDiferida]);

  const estaDesactualizado = busqueda !== busquedaDiferida;

  return (
    <section>
      <h2>⏳ useDeferredValue</h2>
      <p style={{ fontSize: '0.9em', color: '#555' }}>
        Búsqueda en tiempo real sobre {PRODUCTOS_BUSQUEDA.length.toLocaleString()} productos
      </p>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscá productos..."
          style={{
            width: '100%', boxSizing: 'border-box', padding: 10, fontSize: '1.1em',
            border: `2px solid ${estaDesactualizado ? '#f39c12' : '#2ecc71'}`,
            borderRadius: 6, outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
        {estaDesactualizado && (
          <span style={{
            position: 'absolute', right: 12, top: 10, color: '#f39c12', fontWeight: 'bold'
          }}>
            ⏳ actualizando...
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 24, fontSize: '0.85em', marginBottom: 8 }}>
        <span>📝 Input: <strong>{busqueda}</strong></span>
        <span>⏱️ Diferido: <strong>{busquedaDiferida}</strong></span>
        <span>📊 Resultados: <strong>{resultados.length}</strong></span>
      </div>

      <div style={{
        maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 4,
        opacity: estaDesactualizado ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}>
        {resultados.length === 0 && busqueda !== '' && (
          <p style={{ padding: 16, color: '#888' }}>🔍 Sin resultados</p>
        )}
        {resultados.length === 0 && busqueda === '' && (
          <p style={{ padding: 16, color: '#888' }}>📝 Escribí algo para buscar...</p>
        )}
        {resultados.slice(0, 100).map(p => (
          <div key={p.id} style={{
            padding: '6px 10px', borderBottom: '1px solid #eee',
            fontSize: '0.85em'
          }}>
            <strong>{p.nombre}</strong> — 💰 ${p.precio}
            <span style={{ color: '#666' }}> — {p.categoria}</span>
            <p style={{ margin: '2px 0', color: '#888', fontSize: '0.9em' }}>
              {p.descripcion}
            </p>
          </div>
        ))}
        {resultados.length > 100 && (
          <p style={{ padding: 8, color: '#888', fontSize: '0.8em' }}>
            ... y {resultados.length - 100} resultados más
          </p>
        )}
      </div>

      <p style={{ fontSize: '0.85em', color: '#666', marginTop: 8 }}>
        💡 El input se siente responsivo aunque la lista tenga 10,000 productos.
        El filtro pesado usa el <em>valor diferido</em>, que va un paso detrás
        del input. Fijate cómo el borde del input se pone naranja cuando los
        valores están desincronizados.
      </p>
    </section>
  );
}

// =============================================================
// DEMO — Renderiza todo junto
// =============================================================
function Demo() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>🎯 Hooks Avanzados</h1>
      <p style={{ color: '#555' }}>
        useReducer · useCallback · useMemo · useId · useTransition · useDeferredValue
      </p>

      <hr /><ContadorReducer />
      <hr /><ComparacionUseCallback />
      <hr /><BuscadorMemoizado />
      <hr /><DemoFormularios />
      <hr /><PanelTransicion />
      <hr /><BusquedaDiferida />
    </div>
  );
}

// =============================================================
const root = createRoot(document.getElementById('root'));
root.render(<Demo />);
