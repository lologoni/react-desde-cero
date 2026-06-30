# Proyecto 15: Hooks Avanzados

> **Concepto**: `useReducer`, `useCallback`, `useMemo`, `useId`, `useTransition`, `useDeferredValue`

---

## 📖 Nota Académica

Los hooks que viste hasta ahora (`useState`, `useEffect`, `useRef`, `useContext`) resuelven problemas básicos. Pero React tiene hooks **más específicos** para problemas que aparecen cuando tu app crece.

Este módulo cubre los 6 hooks fundamentales que todo desarrollador React debería conocer:

### 🔁 useReducer

> **Problema**: `useState` se vuelve difícil de mantener cuando el estado tiene múltiples campos que dependen entre sí, o cuando las actualizaciones siguen una lógica compleja (ej: carrito de compras, máquina de estados, undo/redo).

**Solución**: una función **reductora pura** que recibe `(estadoActual, accion)` y devuelve el nuevo estado. Este patrón está inspirado en Redux, pero no requiere instalar ninguna dependencia externa.

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

**Ventajas frente a useState cuando el estado es complejo:**
1. La lógica de actualización está **centralizada** en un solo lugar
2. Las acciones son **descriptivas** — se puede identificar la operación realizada con solo leer el `type`
3. El reducer es una función **pura** — se puede testear de forma aislada, sin React
4. Los errores de estado son más fáciles de rastrear y depurar

**⚠️ Cuándo NO usarlo**: si un solo `useState` es suficiente, no es necesario. No es "mejor", es una herramienta para un escenario distinto.

### ⚡ useCallback

> **Problema**: cada vez que un componente se renderiza, se crean NUEVAS instancias de todas las funciones definidas en su cuerpo. Si estas funciones se pasan como propiedades a componentes hijos envueltos en `React.memo`, la comparación de props falla (la nueva referencia de función es distinta a la anterior) y el memo no logra evitar el re-render.

```js
// Sin useCallback — función NUEVA en cada render
const handleClick = () => { setValor(v => v + 1); };

// Con useCallback — MISMA referencia entre renders (hasta que las deps cambien)
const handleClick = useCallback(
  () => { setValor(v => v + 1); },
  []
);
```

**Relación entre useCallback y React.memo:**
- `React.memo` evita que un componente hijo se re-renderice si sus props no cambiaron (comparación por referencia)
- `useCallback` mantiene la misma referencia de función entre renders, permitiendo que `React.memo` funcione correctamente
- Sin `useCallback`, el `memo` es inefectivo porque la función recibida es una referencia distinta en cada render

**⚠️ Importante**: si los componentes hijos NO están envueltos en `React.memo`, `useCallback` no produce ningún beneficio. No optimiza nada por sí mismo.

### 🧮 useMemo

> **Problema**: cada renderización ejecuta la totalidad del código del componente. Si se realiza un filtrado, ordenamiento o transformación costosa, este proceso se repetirá en cada render aunque los datos de entrada no hayan cambiado.

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

**⚠️ No abusar de useMemo**: memoizar tiene un costo (comparación de dependencias, uso de memoria). Debe reservarse para cómputos que sean efectivamente costosos (10,000+ items, transformaciones pesadas, operaciones con complejidad O(n²) o superior).

### 🆔 useId

> **Problema**: para accesibilidad, cada `<input>` debe estar asociado a un `<label>` mediante el atributo `htmlFor`. Si se asignan IDs fijas (hardcodeadas), dos instancias del mismo componente en una página van a colisionar. Además, en SSR (server-side rendering), los IDs generados en el servidor y el cliente pueden no coincidir, causando errores de hidratación.

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

**useId NO debe usarse para keys de listas.** Para ese propósito se sigue utilizando el atributo `key`. useId es específicamente para generar atributos `id` en HTML con fines de accesibilidad (aria-describedby, aria-labelledby, htmlFor, etc.).

Disponible desde React 18.

### 🔄 useTransition

> **Problema**: algunas actualizaciones de estado son computacionalmente costosas (renderizar 50,000 elementos, filtrar una tabla de gran tamaño). Sin `useTransition`, la interfaz se congela hasta que React completa el renderizado, impidiendo cualquier interacción del usuario.

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

**Mecanismo interno:**
1. React marca la actualización como **no urgente**
2. React completa la renderización del estado actual primero (el flag `isPending` se establece en `true`)
3. En el siguiente ciclo de render, React procesa la actualización en segundo plano
4. Si hay interacciones del usuario durante la transición, React las prioriza y pausa la transición

**Diferencia con useDeferredValue:**
- `useTransition`: envuelve la **actualización de estado** directamente
- `useDeferredValue`: envuelve el **valor** (útil cuando no se tiene control directo sobre el setter, ej: el valor proviene de un props o de otro hook)

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

`busqueda` se actualiza **inmediatamente** (el input responde de forma fluida). `busquedaDiferida` se actualiza **cuando React tiene recursos disponibles** (la lista no bloquea el input).

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

A diferencia del módulo anterior, no se creará la carpeta `src/hooks/` porque en este proyecto se utilizan hooks **nativos** de React, no hooks personalizados.

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

Cada sección incluye comentarios que explican el **problema**, la **solución** y el funcionamiento del hook correspondiente. Se recomienda leer los comentarios durante la copia, no solo copiar el código.

### 3. Iniciar el servidor

```bash
npm run dev
```

Abrir `http://localhost:5173`. Se observará:

1. **🔁 useReducer** — contador con historial. Probar las acciones y observar cómo cambia el estado. Luego abrir el detalle "¿Qué pasa si mandamos una acción inválida?" para ver el comportamiento del caso default.

2. **⚡ useCallback + memo** — dos listas lado a lado. Hacer click en "Contador" y notar que a la izquierda TODOS los items incrementan su contador de render, mientras que a la derecha NINGUNO lo hace. Luego hacer toggle en items individuales — ambos lados funcionan igual, pero el izquierdo es ineficiente.

3. **🧮 useMemo** — filtrar 20,000 productos por categoría y stock. Hacer click en "Re-render forzado" — el filtrado NO se repite porque las dependencias (categoría, stock) no cambiaron (ver la consola para los `console.time`). Sin useMemo, cada click filtraría los 20,000 productos nuevamente.

4. **🆔 useId** — dos formularios idénticos. Abrir DevTools → Elements y verificar que cada input tiene un ID diferente (primer formulario: `:R1:`, segundo: `:R3:`, etc.).

5. **🔄 useTransition** — desactivar el checkbox "Usar useTransition" y cambiar de "Rápido" a "Pesado". La UI se congela. Luego activar el checkbox y repetir la operación — aparece "⏳ Cargando..." y la UI sigue respondiendo.

6. **⏳ useDeferredValue** — escribir en el input de búsqueda. Notar que el borde se torna naranja ("actualizando...") cuando el input va adelantado respecto al filtro. La lista de 10,000 productos se filtra sin bloquear el input.

### 4. Experimentación

1. **useReducer**: agregar una acción `MULTIPLICAR` que multiplique el contador por un valor recibido en `payload`
2. **useCallback**: eliminar el `useCallback` de `toggleConCallback` y observar cómo los renders de la columna derecha se comportan igual que los de la izquierda
3. **useMemo**: comentar el `useMemo` y usar la función de filtrado directamente — hacer click en "Re-render forzado" y verificar en la consola que el filtrado se ejecuta en cada render
4. **useId**: abrir el detalle "Sin useId" y observar la advertencia — luego abrir Elements y buscar duplicados de `id="nombre"`
5. **useTransition**: modificar la cantidad de items lentos de `30000` a `50000` o `100000` en `generarItemsLentos()` para acentuar la diferencia
6. **useDeferredValue**: reemplazar `useDeferredValue(busqueda)` por `busqueda` directamente y notar cómo el input pierde fluidez al escribir

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

Construir un **gestor de carrito de compras + catálogo de productos** que utilice TODOS los hooks cubiertos en este módulo.

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

Todo el proceso de filtrado y ordenamiento debe implementarse dentro de un `useMemo`. Debe mostrarse el tiempo de cómputo y la cantidad de resultados obtenidos.

#### 3. `useCallback` — Handlers estables para items del catálogo

Cada producto en el catálogo debe tener un botón "Agregar al carrito".

El handler `agregarAlCarrito` debe estar envuelto en `useCallback` y el componente `ProductoCard` debe estar envuelto en `React.memo`.

Incluir un contador de renders por producto (utilizando `useRef`) para demostrar visualmente que `React.memo` evita renders innecesarios.

#### 4. `useId` — Formulario de checkout accesible

Creá un formulario de checkout (simulado, sin envío real) con los campos:
- Nombre completo
- Dirección
- Email
- Tarjeta de crédito (solo texto, no validación real)

Cada input debe tener su `<label>` asociado mediante `htmlFor` utilizando `useId`. Incluir también una sección colapsable que muestre los IDs generados.

#### 5. `useTransition` — Pestañas del dashboard

Implementá **3 pestañas**: "Catálogo", "Carrito" y "Estadísticas".

La pestaña **Estadísticas** debe generar y renderizar **5,000+ elementos visuales** (ej: barras de un gráfico, filas de una tabla, tarjetas) de forma que el render sea notablemente lento.

El cambio de pestaña debe emplear `startTransition`. Debe mostrarse un indicador `isPending` mientras se renderiza el contenido de "Estadísticas".

#### 6. `useDeferredValue` — Búsqueda responsiva

El input de búsqueda del catálogo debe usar `useDeferredValue`.

- El input se actualiza inmediatamente (responsivo)
- El filtrado usa el valor diferido (no bloquea)
- Mostrá visualmente cuándo el valor está desincronizado (borde de otro color, texto "actualizando...")

### Diseño visual

No utilizar librerías de CSS externas — todo el estilo debe ser inline o mediante un archivo CSS mínimo. El objetivo del proyecto es la correcta aplicación de los hooks, no el diseño visual.

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
| **`useReducer`** | Centraliza la lógica de estado complejo en una función pura con acciones. Sigue el patrón de Redux sin necesidad de librerías externas. |
| **`useCallback`** | Mantiene la misma referencia de función entre renders. Útil solo cuando se combina con `React.memo`. |
| **`useMemo`** | Almacena en caché el resultado de un cómputo costoso hasta que cambien las dependencias. |
| **`useId`** | Genera IDs únicos para accesibilidad. Soluciona colisiones entre instancias y problemas de SSR. |
| **`useTransition`** | Marca actualizaciones lentas como "no urgentes". La UI sigue respondiendo mientras React trabaja en segundo plano. |
| **`useDeferredValue`** | Crea una copia diferida de un valor. El original se actualiza de inmediato, la copia espera. |

### ¿Y ahora qué?

Con estos hooks avanzados quedan **cubiertos los 11 hooks nativos de React** de uso más frecuente:

`useState` · `useEffect` · `useRef` · `useContext` · `useReducer` · `useCallback` · `useMemo` · `useId` · `useTransition` · `useDeferredValue` · `useImperativeHandle` (este último es para casos muy específicos que requieren `forwardRef`)

**En el próximo proyecto** vas a ver **React Router**: navegación entre páginas en una SPA, rutas anidadas, parámetros dinámicos, navegación programática y más.
