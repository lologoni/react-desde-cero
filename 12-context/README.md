# Proyecto 12: Context API

> **Concepto**: `createContext`, `Provider`, `useContext`

---

## 📖 Nota Académica

### El problema: prop drilling

Las props viajan de **padre a hijo**. Pero cuando un componente necesita un dato que está 5 niveles arriba, tenés que pasar la prop por **cada nivel intermedio**, aunque esos componentes no la necesiten.

```jsx
function App() {
  const [usuario, setUsuario] = useState(null);
  return <HomePage usuario={usuario} />;
}

function HomePage({ usuario }) {
  // No necesita usuario, pero lo recibe para pasárselo a NavBar
  return <NavBar usuario={usuario} />;
}

function NavBar({ usuario }) {
  // No necesita usuario, pero lo recibe para pasárselo a UserMenu
  return <UserMenu usuario={usuario} />;
}

function UserMenu({ usuario }) {
  // REcién ACÁ se necesita usuario
  return <p>{usuario?.nombre}</p>;
}
```

A esto se llama **"prop drilling"** (perforación de props) y es un síntoma de que algo no está bien en la arquitectura. Context soluciona esto.

### ¿Qué es Context?

Context es un mecanismo que permite que un valor esté disponible para **cualquier componente en el árbol**, sin tener que pasarlo por props.

Tres pasos:

```jsx
// 1. CREAR el context
const MiContext = createContext(valorPorDefecto);

// 2. PROVEER el valor (en algún nivel del árbol)
<MiContext.Provider value={algunValor}>
  <Componentes />
</MiContext.Provider>

// 3. CONSUMIR el valor (en cualquier componente anidado)
const valor = useContext(MiContext);
```

### createContext

```js
const ThemeContext = createContext(null);
```

Crea un objeto que tiene dos componentes: `Provider` y `Consumer`. El argumento es el valor por defecto, que se usa si un componente consume el context **sin tener un Provider arriba**.

### Provider

```jsx
<ThemeContext.Provider value={{ tema: 'oscuro', toggleTema }}>
  <App />
</ThemeContext.Provider>
```

El Provider envuelve componentes y les da acceso al valor. Cualquier componente **adentro** del Provider puede usar `useContext(ThemeContext)` para obtener el valor.

**Los Providers se pueden anidar:**

```jsx
<ThemeProvider>
  <UserProvider>
    <CarritoProvider>
      <App />
    </CarritoProvider>
  </UserProvider>
</ThemeProvider>
```

Cada Provider agrega un "nivel" de contexto disponible para todos los componentes adentro.

### useContext

```jsx
function PerfilCard() {
  const { usuario } = useContext(UserContext);
  const { tema } = useContext(ThemeContext);
  // ...
}
```

`useContext(context)` devuelve el valor actual del context. Si el valor cambia (por un `useState` en el Provider), TODOS los componentes que usan ese context se **re-renderizan**.

### ¿Qué va en Context vs Props?

| Situación | Usá |
|-----------|-----|
| Un componente pasa datos a un hijo directo | ✅ Props |
| Muchos componentes en distintos niveles necesitan el mismo dato | ✅ Context |
| El dato es global (tema, usuario, locale) | ✅ Context |
| El dato es específico de una sección pequeña | ✅ Props |
| El dato cambia con frecuencia (cada frame) | ⚠️ Considerá otra opción |
| Solo 2 o 3 niveles de profundidad | ✅ Props (no hace falta context) |

### Regla de oro

Context **no es para todo**. No reemplaces todas las props con context. Usalo cuando:

1. Tenés **prop drilling** incómodo (4+ niveles)
2. El dato es **global** (tema, usuario, idioma)
3. **Muchos componentes** necesitan el mismo dato

Si es solo un padre y un hijo, seguí usando props. Son más explícitas.

### ThemeContext + UserContext: el ejemplo clásico

Este proyecto implementa el caso de uso más común de Context:

- **ThemeContext:** provee el tema (claro/oscuro) y la función para cambiarlo
- **UserContext:** provee el usuario actual y las funciones login/logout

Ambos son "globales" porque afectan a toda la app: el tema cambia el color de todo, el usuario aparece en el navbar, en el perfil, en cualquier lado.

---

## 🛠️ Paso a Paso — Creá tu propio proyecto

### 1. Creá el proyecto

```bash
cd react_desde_0
npm create vite@latest 12-context -- --template react
cd 12-context
npm install
rm -rf src/App.jsx src/App.css src/index.css src/assets public
```

### 2. Escribí `src/main.jsx`

```jsx
import { createRoot } from 'react-dom/client';
import { useState, useContext, createContext } from 'react';

// =============================================================
// PASO 1: Crear los Contexts
// =============================================================
const ThemeContext = createContext(null);
const UserContext = createContext(null);

// =============================================================
// PASO 2: Crear los Providers
// =============================================================
function ThemeProvider({ children }) {
  const [tema, setTema] = useState('claro');
  const toggleTema = () => setTema(t => t === 'claro' ? 'oscuro' : 'claro');

  const valorTema = {
    tema, toggleTema,
    colores: tema === 'claro'
      ? { fondo: '#fff', texto: '#333', card: '#f5f5f5', borde: '#ddd' }
      : { fondo: '#1a1a2e', texto: '#eee', card: '#16213e', borde: '#0f3460' },
  };

  return <ThemeContext.Provider value={valorTema}>{children}</ThemeContext.Provider>;
}

function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const login = (nombre) => setUsuario({ nombre, email: `${nombre}@ejemplo.com`, rol: 'usuario' });
  const logout = () => setUsuario(null);
  return <UserContext.Provider value={{ usuario, login, logout }}>{children}</UserContext.Provider>;
}

// =============================================================
// PASO 3: Consumir los Contexts con useContext
// =============================================================
function Navbar() {
  const { usuario, login, logout } = useContext(UserContext);
  const { colores, toggleTema } = useContext(ThemeContext);

  return (
    <nav style={{
      background: colores.card, color: colores.texto, padding: '12px 20px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: `2px solid ${colores.borde}`,
    }}>
      <h3 style={{ margin: 0 }}>🎨 Context App</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={toggleTema}>
          {colores.fondo === '#fff' ? '🌙 Oscuro' : '☀️ Claro'}
        </button>
        {usuario ? (
          <span>👋 {usuario.nombre} <button onClick={logout}>Salir</button></span>
        ) : (
          <button onClick={() => login('Martina')}>Iniciar sesión</button>
        )}
      </div>
    </nav>
  );
}

function PerfilCard() {
  const { usuario } = useContext(UserContext);
  const { colores } = useContext(ThemeContext);

  return (
    <div style={{
      background: colores.card, color: colores.texto,
      border: `1px solid ${colores.borde}`, borderRadius: 12, padding: 20,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '3em' }}>{usuario ? '👤' : '👻'}</div>
      <h2>{usuario ? usuario.nombre : 'Invitado'}</h2>
      {usuario && <p>📧 {usuario.email}</p>}
    </div>
  );
}

function MainContent() {
  const { colores } = useContext(ThemeContext);

  return (
    <main style={{
      background: colores.fondo, color: colores.texto,
      minHeight: 'calc(100vh - 60px)', padding: 20,
      transition: 'background 0.3s, color 0.3s',
    }}>
      <h1>🎯 Context API</h1>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <PerfilCard />
      </div>
    </main>
  );
}

// =============================================================
// App: se envuelve con los Providers
// =============================================================
function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Navbar />
        <MainContent />
      </UserProvider>
    </ThemeProvider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### 3. Iniciá el servidor

```bash
npm run dev
```

Abrí `http://localhost:5173`. Vas a ver:

- **Modo claro/oscuro:** cambiá el tema desde cualquier componente
- **Login/logout:** iniciá sesión y el nombre aparece en el navbar y el perfil
- **Sin prop drilling:** ni Navbar ni PerfilCard reciben props — usan useContext

### 4. Experimentá

1. **Sacá un Provider** — comentá `<UserProvider>` y fijate qué pasa (usuario se vuelve null, pero no rompe gracias al valor por defecto)
2. **Agregá un nivel más** de anidación y creá un componente que use context sin recibir props
3. **Cambiá los colores** del tema para que sea rojo/azul en lugar de claro/oscuro
4. **Agregá un tercer context** (ej: `IdiomaContext` con español/inglés)
5. **Mové el Navbar FUERA** de los Providers — fijate que useContext devuelve el valor por defecto (null)

---

## 📄 Código Completo

### `package.json`

```json
{
  "name": "12-context",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.2",
    "vite": "^8.1.0"
  }
}
```

---

## 🎯 Proyecto para hacer solo

Creá un proyecto NUEVO llamado `12-context-practica`.

### Consigna

Construí una **aplicación de carrito de compras** usando Context API.

**Requisitos técnicos:**

1. Creá un **`CarritoContext`** que contenga:
   - Array de productos en el carrito
   - Función `agregarProducto(producto)` — agrega al carrito
   - Función `eliminarProducto(id)` — elimina del carrito
   - Función `vaciarCarrito()` — vacía todo
   - Función `actualizarCantidad(id, cantidad)` — cambia cantidad
   - Total de items y precio total (derivados)

2. Creá un **`ProductosContext`** que contenga:
   - Array de productos disponibles (al menos 6)
   - Función `buscarProductos(texto)` — filtra productos

3. Componentes:
   - **ProductList:** muestra los productos disponibles con botón "Agregar"
   - **CartWidget:** en el navbar, muestra la cantidad de items del carrito
   - **CartModal:** muestra el detalle del carrito con cantidades y precios
   - **Header:** muestra el logo y el CartWidget

4. **Importante:** ninguno de estos componentes puede recibir props relacionadas al carrito o productos. Todo debe ir por Context.

**Estructura sugerida:**

```jsx
// Contexts
const CarritoContext = createContext(null);
const ProductosContext = createContext(null);

// Providers
function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  // ... funciones
  return <CarritoContext.Provider value={...}>{children}</CarritoContext.Provider>;
}

// Componentes
function ProductCard({ producto }) {
  // No recibe funciones del carrito por props — usa useContext
  const { agregarProducto } = useContext(CarritoContext);
  // ...
}
```

**Extras (si querés ir más allá):**
- Guardar el carrito en `localStorage` para que persista al recargar
- Agregar animaciones al agregar/eliminar productos
- Permitir aplicar un código de descuento
- Calcular impuestos y total con envío

---

## 🧠 Resumen

| Concepto | Explicación breve |
|----------|-------------------|
| **`createContext(valor)`** | Crea un contexto con un valor por defecto. |
| **`Context.Provider`** | Componente que provee el valor a todos sus hijos. |
| **`useContext(Context)`** | Hook que obtiene el valor actual del context. |
| **Prop drilling** | Problema de pasar props por muchos niveles innecesarios. Context lo soluciona. |
| **Anidar Providers** | Se pueden anidar varios contexts (Theme, User, Cart, etc.). |
| **Re-render** | Cuando el valor del Provider cambia, todos los consumidores se re-renderizan. |
| **No es para todo** | Para padre → hijo directo, seguí usando props. Context es para datos globales. |

**En el próximo proyecto** vas a crear tu **primer custom hook** — la forma de extraer lógica de los componentes y reutilizarla.
