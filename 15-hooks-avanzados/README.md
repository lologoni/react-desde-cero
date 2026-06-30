# Proyecto 15: Hooks Avanzados

> **Concepto**: `useReducer`, `useCallback`, `useMemo`, `useId`, `useTransition`, `useDeferredValue`

---

## 📖 Nota Académica

Los hooks que viste hasta ahora (`useState`, `useEffect`, `useRef`, `useContext`) resuelven problemas básicos. Pero React tiene hooks **más específicos** para problemas que aparecen cuando tu app crece.

Este módulo cubre los 6 hooks que TODO dev React debería conocer:

### 🔁 useReducer

> **Problema**: `useState` se vuelve un quilombo cuando el estado tiene múltiples campos que dependen entre sí, o cuando las actualizaciones siguen una lógica compleja (ej: carrito de compras, máquina de estados, undo/redo).

**Solución**: una función **reductora pura** que recibe `(estadoActual, accion)` y devuelve el nuevo estado. Inspirado en el patrón Redux, pero sin necesidad de instalar nada.

```js
const [state, dispatch] = useReducer(reducer, initialState);

// reducer es una función PURA (sin efectos secundarios):
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENTAR': return { count: state.count + 1 };
    case 'DECREMENTAR': return { count: state.count - 1 };
    case 'RESETEAR':    return { count: 0 };
    default:            return state;
  }
}

// Para actualizar, "disparás" acciones:
dispatch({ type: 'INCREMENTAR' });
dispatch({ type: 'ESTABLECER', payload: 42 });
```

**¿Por qué es mejor que useState cuando el estado es complejo?**
1. La lógica de actualización está **centralizada** en un solo lugar
2. Las acciones son **descriptivas** (sabés qué pasó con solo leer el type)
3. El reducer es una función **pura** — podés testearla sin React
4. Los errores de estado son más fáciles de rastrear

**⚠️ Cuándo NO usarlo**: si un solo `useState` te alcanza, no lo necesitás. No es "mejor", es "para otra cosa".

### ⚡ useCallback

> **Problema**: cada render crea NUEVAS instancias de todas las funciones definidas en el componente. Si pasás esas funciones a hijos envueltos en `React.memo`, las funciones nuevas rompen la comparación y el memo no sirve.

```js
// Sin useCallback — función NUEVA cada render
const handleClick = () => { setValor(v => v + 1); };

// Con useCallback — MISMA referencia entre renders
const handleClick = useCallback(
  () => { setValor(v => v + 1); },
  []  // solo cambia si estas deps cambian
);
```

**useCallback + React.memo = la combinación ganadora:**
- `React.memo` evita que un hijo se re-renderice si sus props no cambiaron
- `useCallback` mantiene la misma referencia de función entre renders
- Sin `useCallback`, el `memo` no sirve porque la función es "otra" cada vez

**⚠️ No es magia**: si los hijos NO están envueltos en `React.memo`, `useCallback` no sirve para NADA. No optimiza nada por sí solo.

### 🧮 useMemo

> **Problema**: cada render ejecuta todo el código del componente. Si tenés un filtro, ordenamiento o transformación costosa, se va a re-ejecutar aunque los datos de entrada no hayan cambiado.

```js
// Sin useMemo — se ejecuta CADA render
const filtrados = productos.filter(p => p.categoria === categoria);

// Con useMemo — solo se ejecuta cuando cambian las deps
const filtrados = useMemo(
  () => productos.filter(p => p.categoria === categoria),
  [productos, categoria]
);
```

**Diferencia clave entre useCallback y useMemo:**
| Hook | Guarda | Devuelve |
|------|--------|----------|
| `useCallback(fn, deps)` | La **función** en sí | La función |
| `useMemo(() => fn(), deps)` | El **resultado** de la función | El valor |

```js
useCallback(fn, deps)  ===  useMemo(() => fn, deps)
```

**⚠️ No pongas todo en useMemo**: memoizar tiene costo (comparación de deps, memoria). Usalo solo para cómputos que sean efectivamente costosos (10,000+ items, transformaciones pesadas).

### 🆔 useId

> **Problema**: para accesibilidad, cada `<input>` necesita un `<label>` con `htmlFor={id}`. Si hardcodeás los IDs, dos instancias del mismo componente en la página van a colisionar. En SSR (server-side rendering), los IDs del servidor y el cliente pueden no coincidir, causando errores de hidratación.

```js
function Formulario() {
  const nombreId = useId();
  const emailId = useId();

  return (
    <form>
      <label htmlFor={nombreId}>Nombre:</label>
      <input id={nombreId} type="text" />

      <label htmlFor={emailId}>Email:</label>
      <input id={emailId} type="email" />
    </form>
  );
}

// Dos formularios en la página — IDs NO colisionan
<Formulario /> {/* IDs: :R1:, :R2: */}
<Formulario /> {/* IDs: :R3:, :R4: — DIFERENTES */}
```

**useId NO es para keys de listas.** Para eso seguís usando `key`. useId es específicamente para atributos `id` en HTML (accesibilidad, aria-describedby, etc.).

Disponible desde React 18.

### 🔄 useTransition

> **Problema**: algunas actualizaciones de estado son lentas (renderizar 50,000 items, filtrar una tabla enorme). Sin `useTransition`, la UI se congela hasta que React termina. El usuario no puede ni clickear.

```js
const [isPending, startTransition] = useTransition();

function cambiarAPesado() {
  // Sin transición: la UI se congela
  // setTab('pesado');

  // Con transición: React prioriza la UI, el render pesado va en background
  startTransition(() => {
    setTab('pesado');
  });
}

// Mientras la transición está en proceso:
{isPending && <p>⏳ Cargando...</p>}
```

**¿Qué hace exactamente?**
1. React marca el update como **no urgente**
2. React termina de pintar el estado actual primero (el `isPending` se vuelve `true`)
3. En el próximo "frame", React procesa el update en segundo plano
4. Si hay interacciones del usuario mientras tanto, React las prioriza

**Diferencia con useDeferredValue:**
- `useTransition`: envolvés la **actualización de estado**
- `useDeferredValue`: envolvés el **valor** (útil cuando no tenés control directo sobre el setter)

### ⏳ useDeferredValue

> **Problema**: mismo caso que useTransition, pero el valor que querés diferir no viene de un setState directo. Ejemplo: un input de búsqueda donde el usuario tipea y el filtrado es lento.

```js
const [busqueda, setBusqueda] = useState('');
const busquedaDiferida = useDeferredValue(busqueda);

// El input siempre responde (usa busqueda)
// La lista usa busquedaDiferida (va un paso atrás)
const resultados = useMemo(
  () => productos.filter(p => p.nombre.includes(busquedaDiferida)),
  [busquedaDiferida]
);
```

`busqueda` se actualiza **inmediatamente** (el input se siente responsivo). `busquedaDiferida` se actualiza **cuando React tiene tiempo** (la lista no bloquea el input).

### Tabla comparativa

| Hook | ¿Para qué? | ¿Con qué se combina? |
|------|-----------|---------------------|
| `useReducer` | Estado complejo con acciones | dispatch, reducer |
| `useCallback` | Funciones estables entre renders | `React.memo` |
| `useMemo` | Cómputos costosos que no deberían repetirse | Dependencias |
| `useId` | IDs únicos para accesibilidad | `htmlFor` / `id` |
| `useTransition` | Updates no urgentes que no bloquean la UI | `startTransition`, `isPending` |
| `useDeferredValue` | Valores que pueden "ir detrás" del original | `useMemo` (para el cómputo diferido) |

---

## 🛠️ Paso a Paso — Creá tu propio proyecto

### 1. Creá el proyecto

```bash
cd react_desde_0
npm create vite@latest 15-hooks-avanzados -- --template react
cd 15-hooks-avanzados
npm install
rm -rf src/App.jsx src/App.css src/index.css src/assets public
```

No creamos carpeta `src/hooks/` esta vez porque vamos a usar hooks **nativos** de React, no custom hooks.

### 2. Escribí `src/main.jsx`

Copiá el contenido completo de `src/main.jsx`. El archivo tiene 6 secciones, una por hook, cada una con su propio componente.

Acá están los componentes que vas a encontrar:

| Sección | Hook | Componente |
|---------|------|------------|
| 1 | `useReducer` | `ContadorReducer` |
| 2 | `useCallback` + `memo` | `ComparacionUseCallback` / `ItemDemo` |
| 3 | `useMemo` | `BuscadorMemoizado` |
| 4 | `useId` | `FormularioRegistro` / `DemoFormularios` |
| 5 | `useTransition` | `PanelTransicion` / `PanelLento` / `PanelRapido` |
| 6 | `useDeferredValue` | `BusquedaDiferida` |

Cada sección tiene comentarios que explican el **problema**, la **solución** y cómo funciona el hook. No solo copíes — leé los comentarios mientras copiás.

### 3. Iniciá el servidor

```bash
npm run dev
```

Abrí `http://localhost:5173`. Vas a ver:

1. **🔁 useReducer** — contador con historial. Probá las acciones y fijate cómo cambia el estado. Después abrí el detalle "¿Qué pasa si mandamos una acción inválida?" y probalo.

2. **⚡ useCallback + memo** — dos listas lado a lado. Apretá "Contador" y fijate que a la izquierda TODOS los items muestran un render más, a la derecha NINGUNO. Después toggleá items individuales — ambos lados funcionan igual, pero el izquierdo es ineficiente.

3. **🧮 useMemo** — filtrá 20,000 productos por categoría y stock. Apretá "Re-render forzado" — el filtrado NO se repite porque las dependencias no cambiaron (mirá la consola para ver los `console.time`). Sin useMemo, cada click filtraría los 20,000 productos de nuevo.

4. **🆔 useId** — dos formularios idénticos. Abrí las DevTools → Elements y fijate que cada input tiene un ID diferente (el primer formulario usa `:R1:`, el segundo `:R3:`, etc.).

5. **🔄 useTransition** — desactivá el checkbox "Usar useTransition" y cambiate de "Rápido" a "Pesado". La UI se congela. Ahora activá el checkbox y hace lo mismo — ves "⏳ Cargando..." y la UI sigue respondiendo.

6. **⏳ useDeferredValue** — escribí en el input de búsqueda. Fijate que el borde se pone naranja ("actualizando...") cuando el input va adelante del filtro. La lista de 10,000 productos se filtra sin bloquear el input.

### 4. Experimentá

1. En `useReducer`: agregá una acción `MULTIPLICAR` que multiplique el count por un valor recibido en `payload`
2. En `useCallback`: sacá el `useCallback` de `toggleConCallback` y fijate cómo los renders de la derecha se comportan igual que los de la izquierda
3. En `useMemo`: comentá el `useMemo` y usá la función directa — apretá "Re-render forzado" y mirá la consola
4. En `useId`: abrí el detalle "Sin useId" y fijate el warning — después abrí Elements y buscá duplicados de `id="nombre"`
5. En `useTransition`: cambió la cantidad de items lentos de `30000` a `50000` o `100000` en `generarItemsLentos()`
6. En `useDeferredValue`: cambió `useDeferredValue(busqueda)` por `busqueda` directo — sentí cómo el input se vuelve lerdo

---

## 📄 Estructura del proyecto

```
15-hooks-avanzados/
├── src/
│   └── main.jsx          # 6 ejemplos, uno por hook, en un solo archivo
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

A diferencia del módulo 13, no hay hooks personalizados en `src/hooks/` — los hooks que vemos acá son parte del core de React.

---

## 🎯 Proyecto para hacer solo

Creá un proyecto NUEVO llamado `15-hooks-avanzados-practica`.

### Consigna

Construí un **gestor de carrito de compras + catálogo de productos** que use TODOS los hooks de este módulo.

**Stack:** Vite + React (sin librerías externas)

### Requisitos por hook

#### 1. `useReducer` — Estado del carrito

El carrito debe manejarse con `useReducer`. Las acciones deben ser:

| Acción | Payload | Efecto |
|--------|---------|--------|
| `AGREGAR_PRODUCTO` | `{ id, nombre, precio, cantidad }` | Agrega al carrito o suma cantidad si ya existe |
| `QUITAR_PRODUCTO` | `id` | Reduce cantidad en 1, elimina si llega a 0 |
| `ELIMINAR_PRODUCTO` | `id` | Elimina del carrito sin importar la cantidad |
| `LIMPIAR_CARRITO` | — | Vacía el carrito por completo |
| `APLICAR_DESCUENTO` | `porcentaje` (número entre 0 y 100) | Aplica descuento sobre el total |

**Reducer debe calcular:**
- `totalItems`: suma de todas las cantidades
- `subtotal`: suma de precio × cantidad
- `descuento`: valor del descuento aplicado (0 si no hay)
- `total`: subtotal - descuento

#### 2. `useMemo` — Catálogo filtrado y ordenado

Creá un array de **50 productos mock** con `{ id, nombre, categoria, precio, rating }`.

Implementá:
- **Filtro por categoría** (select)
- **Filtro por precio mínimo/máximo** (dos inputs numéricos)
- **Ordenamiento** (az, za, menor precio, mayor precio)
- **Búsqueda por nombre** (text input)

Todo el filtrado + ordenamiento debe ir dentro de un `useMemo`. Mostrá el tiempo de computación y la cantidad de resultados.

#### 3. `useCallback` — Handlers estables para items del catálogo

Cada producto en el catálogo debe tener un botón "Agregar al carrito".

El handler `agregarAlCarrito` debe estar envuelto en `useCallback` y el componente `ProductoCard` debe estar envuelto en `React.memo`.

Agregá un contador de renders por producto (usando `useRef`) para demostrar que el memo funciona.

#### 4. `useId` — Formulario de checkout accesible

Creá un formulario de checkout (simulado, sin envío real) con los campos:
- Nombre completo
- Dirección
- Email
- Tarjeta de crédito (solo texto, no validación real)

Cada input debe tener su `<label>` conectado con `htmlFor` usando `useId`. Mostrá también los IDs generados en un detalle colapsable.

#### 5. `useTransition` — Pestañas del dashboard

Implementá **3 pestañas**: "Catálogo", "Carrito" y "Estadísticas".

La pestaña **Estadísticas** debe generar y renderizar **5,000+ elementos visuales** (ej: barras de un gráfico, filas de una tabla, tarjetas) de forma que el render sea notablemente lento.

El cambio de pestaña debe usar `startTransition`. Mostrá un indicador `isPending` mientras se renderiza "Estadísticas".

#### 6. `useDeferredValue` — Búsqueda responsiva

El input de búsqueda del catálogo debe usar `useDeferredValue`.

- El input se actualiza inmediatamente (responsivo)
- El filtrado usa el valor diferido (no bloquea)
- Mostrá visualmente cuándo el valor está desincronizado (borde de otro color, texto "actualizando...")

### Diseño visual

No usés librerías de CSS — todo inline style o un archivo CSS mínimo. El foco está en los hooks, no en el diseño.

### Bonus (si querés ir más allá)

1. **Persistencia**: guardá el carrito en localStorage (¿con qué hook combinás esto?)
2. **Notificaciones**: cuando se agrega un producto, mostrá una notificación temporal que desaparezca sola (pista: necesitás useEffect + useState)
3. **Historial de cambios**: cada acción del reducer debería guardarse en un historial. Agregá un botón "Deshacer última acción"
4. **Modo oscuro**: implementá toggle con CSS variables

### Criterios de evaluación

| Criterio | OK |
|----------|----|
| Cada hook del módulo se usa al menos una vez | ☐ |
| El reducer maneja los 5 tipos de acción | ☐ |
| React.memo + useCallback evitan renders innecesarios | ☐ |
| El filtrado/ordenamiento está memoizado con useMemo | ☐ |
| Los labels del checkout usan useId (sin IDs hardcodeadas) | ☐ |
| El cambio a la pestaña "Estadísticas" usa startTransition | ☐ |
| La búsqueda usa useDeferredValue (input responsivo) | ☐ |
| Se muestran indicadores visuales (render count, pending, desincronización) | ☐ |

---

## 🧠 Resumen

| Hook | Explicación breve |
|------|-------------------|
| **`useReducer`** | Centralizá la lógica de estado complejo en una función pura con acciones. Como Redux sin Redux. |
| **`useCallback`** | Mantené la misma referencia de función entre renders. Solo sirve combinado con `React.memo`. |
| **`useMemo`** | Cacheá el resultado de un cómputo costoso hasta que cambien las dependencias. |
| **`useId`** | Generá IDs únicos para accesibilidad. Soluciona colisiones entre instancias y problemas de SSR. |
| **`useTransition`** | Marcá updates lentos como "no urgentes". La UI sigue respondiendo mientras React trabaja en background. |
| **`useDeferredValue`** | Creá una copia diferida de un valor. El original se actualiza ya, la copia espera. |

### ¿Y ahora qué?

Con estos hooks avanzados tenés **cubiertos los 11 hooks nativos de React** que se usan en el día a día:

`useState` · `useEffect` · `useRef` · `useContext` · `useReducer` · `useCallback` · `useMemo` · `useId` · `useTransition` · `useDeferredValue` · `useImperativeHandle` (el que falta, pero es para casos muy específicos con `forwardRef`)

**En el próximo proyecto** vas a ver **React Router**: navegación entre páginas en una SPA, rutas anidadas, parámetros dinámicos, navegación programática y más.
