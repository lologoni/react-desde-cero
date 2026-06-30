# Proyecto 16: Conexión con API

> **Concepto**: Fetch API, CRUD, loading states, error handling, variables de entorno

---

## 📖 Nota Académica

### ¿Qué es una API REST?

Una **API REST** (Representational State Transfer) es una interfaz que permite a dos aplicaciones comunicarse a través de HTTP. En el contexto de React, la API es el "backend" que nos provee los datos que mostramos en pantalla.

**Formato**: las API REST modernas intercambian datos en **JSON** (JavaScript Object Notation).

### Verbos HTTP (CRUD)

Toda API REST opera sobre **recursos** (usuarios, publicaciones, productos) mediante verbos HTTP:

| Verbo | Operación | Ejemplo |
|-------|-----------|---------|
| **GET** | Leer (Read) | `GET /users` → obtiene todos los usuarios |
| **POST** | Crear (Create) | `POST /posts` → crea una nueva publicación |
| **PUT** | Reemplazar (Update) | `PUT /posts/1` → reemplaza la publicación con id=1 |
| **PATCH** | Actualizar parcialmente | `PATCH /posts/1` → modifica solo algunos campos |
| **DELETE** | Eliminar (Delete) | `DELETE /posts/1` → elimina la publicación con id=1 |

### Fetch API

El navegador proporciona `fetch()` para hacer peticiones HTTP. Es nativo: no requiere instalar nada.

```js
// GET — obtener datos
const respuesta = await fetch('https://api.ejemplo.com/users');
const datos = await respuesta.json();

// POST — crear datos
const respuesta = await fetch('https://api.ejemplo.com/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Nuevo post', body: 'Contenido' }),
});
const creado = await respuesta.json();
```

**fetch() devuelve una Promise.** El código asíncrono se maneja con `async/await` o `.then()/.catch()`.

### Los 3 estados de una petición asíncrona

Toda petición a una API pasa por exactamente 3 estados. Un componente bien diseñado debe manejar los 3:

```
LOADING → SUCCESS
    ↓
  ERROR
```

| Estado | ¿Qué significa? | ¿Qué mostrar? |
|--------|----------------|---------------|
| **LOADING** | La petición está en curso | Spinner, skeleton loader, "Cargando..." |
| **ERROR** | La petición falló (red, HTTP 4xx/5xx) | Mensaje de error + botón de reintento |
| **SUCCESS** | Los datos llegaron correctamente | Los datos renderizados |

**Implementación con useState + useEffect:**

```js
function ListadoUsuarios() {
  const [usuarios, setUsuarios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(setUsuarios)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>⏳ Cargando...</p>;
  if (error) return <p>❌ {error}</p>;
  return <ul>{usuarios.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

Este patrón se repite para CADA petición GET. Por eso tiene sentido encapsularlo en un **custom hook**.

### Custom hook useApi

El hook `useApi` (que encontrás en `src/hooks/useApi.js`) encapsula:

1. Los 3 estados (loading, error, data)
2. Cancelación automática con `AbortController` (evita actualizar estado en componentes desmontados)
3. Una función `refetch` para reintentar
4. Una función `apiMutacion` independiente para POST/PUT/DELETE

```js
const { data, loading, error, refetch } = useApi('/users');
// data:    los datos cuando llegan (null al inicio)
// loading: true mientras se espera la respuesta
// error:   mensaje de error si algo falla (null si ok)
// refetch: función para volver a ejecutar la petición
```

### AbortController

Cuando un componente se desmonta (ej: el usuario navega a otra pantalla) mientras una petición está en curso, React muestra un warning:

> Warning: Can't perform a React state update on an unmounted component.

`AbortController` resuelve esto: al desmontar el componente, se aborta la petición y no se intenta actualizar el estado.

```js
const controller = new AbortController();

fetch(url, { signal: controller.signal })
  .then(res => res.json())
  .then(data => setData(data)) // No se ejecuta si se abortó
  .catch(err => {
    if (err.name === 'AbortError') return; // Ignorar abortos
    setError(err.message);
  });

// En el cleanup del efecto:
return () => controller.abort();
```

### Variables de entorno

Las URLs de API, tokens y configuraciones sensibles NO deben estar hardcodeadas en el código. En Vite, las variables de entorno se definen en un archivo `.env` y se accede mediante `import.meta.env`:

```
# .env
VITE_API_URL=https://jsonplaceholder.typicode.com
```

```js
const API_URL = import.meta.env.VITE_API_URL;
```

**Reglas:**
- Solo las variables que empiezan con `VITE_` se exponen al cliente
- El archivo `.env` NO debe subirse al repositorio (está en `.gitignore`)
- Creá un `.env.example` como plantilla para otros desarrolladores

---

## 🛠️ Paso a Paso — Creá tu propio proyecto

### 1. Creá el proyecto

```bash
cd react_desde_0
npm create vite@latest 16-api-conexion -- --template react
cd 16-api-conexion
npm install
rm -rf src/App.jsx src/App.css src/index.css src/assets public
mkdir src/hooks
```

### 2. Configurá las variables de entorno

Creá `.env` en la raíz del proyecto:

```
VITE_API_URL=https://jsonplaceholder.typicode.com
```

### 3. Creá el hook `src/hooks/useApi.js`

Este hook encapsula la lógica de peticiones GET con los 3 estados y una función auxiliar para mutaciones.

Ver `src/hooks/useApi.js` en el código del proyecto.

### 4. Escribí `src/main.jsx`

Copiá el contenido de `src/main.jsx`. El archivo contiene 4 secciones:

| Sección | Concepto | Componente |
|---------|----------|------------|
| 1 | GET + loading skeleton + error + retry | `ListadoUsuarios` |
| 2 | POST con formulario | `CrearPublicacion` |
| 3 | GET + useDeferredValue (búsqueda responsiva) | `BuscadorPosts` |
| 4 | Manejo de errores (404) | `DemostracionError` |

### 5. Iniciá el servidor

```bash
npm run dev
```

Abrí `http://localhost:5173`. Vas a ver:

1. **👥 Listado de usuarios** — se cargan 10 usuarios desde la API. Mientras carga, se ven 5 esqueletos grises (skeleton loader). Si la API falla, aparece un mensaje de error con botón "Reintentar".

2. **✍️ Crear publicación** — formulario que envía un POST a la API. Completá título y cuerpo, apretá "Publicar". La API responde con un objeto que incluye un ID simulado (JSONPlaceholder no persiste realmente, pero devuelve la respuesta correcta).

3. **🔍 Búsqueda en posts** — se cargan los 100 posts de la API. El input de búsqueda usa `useDeferredValue` para mantener la interfaz responsiva. El borde se pone naranja mientras el filtro está desincronizado.

4. **⚠️ Manejo de errores** — este componente apunta a una ruta inexistente a propósito. Observá cómo el hook captura el error 404 y permite reintentar.

### 6. Experimentación

1. **Simular error de red**: abrí DevTools → Network → "Offline", apretá "Reintentar" y observá cómo se ve el error de red
2. **Cambiar de API**: modificá `VITE_API_URL` en `.env` para apuntar a otra API (ej: `https://api.github.com`) y observá cómo cambian los datos
3. **Probar el skeleton**: desactivá la cache en DevTools → Network → "Disable cache" y recargá — vas a ver los skeletons claramente
4. **Agregar DELETE**: usá `apiMutacion` para agregar un botón "Eliminar" en la lista de usuarios
5. **Probar AbortController**: andá a la pestaña Network, seleccioná "Slow 3G", y navegá rápidamente entre secciones (si hubiera navegación) — no deberían aparecer warnings en la consola

---

## 📄 Estructura del proyecto

```
16-api-conexion/
├── src/
│   ├── hooks/
│   │   └── useApi.js        # Hook personalizado para API calls
│   └── main.jsx             # 4 ejemplos: GET, POST, búsqueda, errores
├── .env                     # VITE_API_URL
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎯 Proyecto para hacer solo

Creá un proyecto NUEVO llamado `16-api-conexion-practica`.

### Consigna

Construí un **gestor de tareas conectado a una API REST** que implemente CRUD completo.

**Stack:** Vite + React + JSONPlaceholder (o cualquier API REST pública)

### Requisitos

#### 1. GET — Listado de tareas

- Al cargar la página, obtener las tareas desde `${API_URL}/todos`
- Mostrar **loading skeleton** mientras se cargan (mínimo 3 elementos de esqueleto)
- Si hay error, mostrar mensaje con **botón de reintento**
- Si no hay tareas, mostrar mensaje "No hay tareas"

#### 2. POST — Crear tarea

- Formulario con campo "Título" y checkbox "Completada"
- Al enviar, hacer un POST a `${API_URL}/todos`
- La nueva tarea debe aparecer en la lista SIN recargar la página
- Deshabilitar el botón mientras se está publicando
- Validar que el título no esté vacío

#### 3. PATCH — Actualizar tarea

- Cada tarea debe tener un checkbox que permita marcarla como completada/pendiente
- Al cambiar el estado, hacer un PATCH a `${API_URL}/todos/${id}`
- Mostrar un indicador visual mientras se está actualizando (ej: opacidad reducida)

#### 4. DELETE — Eliminar tarea

- Cada tarea debe tener un botón "Eliminar"
- Al hacer click, hacer un DELETE a `${API_URL}/todos/${id}`
- Mostrar confirmación antes de eliminar (`window.confirm` o un modal propio)
- La tarea debe desaparecer de la lista sin recargar

#### 5. Búsqueda con useDeferredValue

- Input de búsqueda que filtre las tareas por título
- Usar `useDeferredValue` para mantener el input responsivo
- Mostrar indicador visual cuando el filtro está desactualizado

#### 6. Contador de renders

- Envolver `TareaItem` en `React.memo` y usar `useCallback` para los handlers
- Incluir contador de renders (con `useRef`) para demostrar que el memo funciona

### Criterios de evaluación

| Criterio | OK |
|----------|----|
| Los 4 verbos HTTP (GET, POST, PATCH, DELETE) están implementados | ☐ |
| Los 3 estados (loading, error, success) se manejan en cada petición | ☐ |
| Hay skeleton loader mientras se cargan datos | ☐ |
| El formulario de creación valida campos y deshabilita el botón durante el envío | ☐ |
| El checkbox de tarea usa PATCH para actualizar | ☐ |
| DELETE pide confirmación antes de eliminar | ☐ |
| La búsqueda usa useDeferredValue (input responsivo) | ☐ |
| React.memo + useCallback evitan renders innecesarios | ☐ |
| Hay un contador de renders visible en cada tarea | ☐ |
| La URL de la API está en una variable de entorno | ☐ |

### Bonus

1. **Paginación**: agregar botones "Anterior / Siguiente" para navegar entre páginas de tareas (JSONPlaceholder soporta `?_page=1&_limit=10`)
2. **Ordenamiento**: permitir ordenar por título (A-Z, Z-A) o por estado (completadas primero)
3. **Filtro por estado**: mostrar "Todas", "Pendientes" o "Completadas"
4. **Estadísticas**: mostrar "X de Y tareas completadas" con una barra de progreso
5. **Persistencia simulada**: guardar las tareas creadas/actualizadas en localStorage para que persistan entre recargas (dado que JSONPlaceholder no persiste realmente)

---

## 🧠 Resumen

| Concepto | Explicación |
|----------|-------------|
| **API REST** | Interfaz HTTP que expone recursos mediante verbos (GET, POST, PUT, PATCH, DELETE) |
| **Fetch API** | Función nativa del navegador para hacer peticiones HTTP. Devuelve Promises. |
| **async/await** | Sintaxis para manejar código asíncrono sin callbacks anidados ni .then() |
| **3 estados** | Toda petición pasa por loading → success/error. El componente debe manejar los 3. |
| **Loading skeleton** | Placeholder visual que se muestra mientras los datos se cargan. Mejora la UX. |
| **AbortController** | Mecanismo nativo para cancelar peticiones fetch. Evita warnings en componentes desmontados. |
| **Variables de entorno** | Configuración externa al código (`.env`). En Vite se accede con `import.meta.env.VITE_*` |
| **Custom hook useApi** | Encapsula la lógica repetitiva de fetch/loading/error/refetch en un hook reutilizable. |

### Diferencias entre fetch y Axios

| Característica | Fetch (nativo) | Axios (librería externa) |
|----------------|---------------|--------------------------|
| Instalación | Ninguna (navegador) | `npm install axios` |
| JSON automático | No — requiere `.json()` | Sí |
| Manejo de errores HTTP | Solo errores de red — 4xx/5xx no lanzan error | Sí, lanza error en 4xx/5xx |
| Timeout | No nativo — requiere AbortController | Sí, `axios.get(url, { timeout: 5000 })` |
| Interceptors | No | Sí (para tokens, logging, etc.) |
| Bundle size | 0 KB | ~14 KB gzipped |

Para apps simples, fetch es suficiente. Para apps con manejo de autenticación, interceptors y múltiples fuentes de datos, Axios puede ser más conveniente.

### ¿Y ahora qué?

Este módulo cubre la comunicación con APIs externas, que es la base de casi cualquier aplicación React moderna. Desde acá podés:

- **Agregar autenticación** (JWT tokens, refresh tokens)
- **Usar React Query / TanStack Query** para caché y sincronización automática
- **Conectar con GraphQL** (Apollo Client)
- **Implementar WebSockets** para datos en tiempo real
- **Usar Axios** como alternativa más completa a fetch

**En el próximo proyecto** podríamos explorar autenticación, o un proyecto integrador que combine todos los conceptos del curso.
