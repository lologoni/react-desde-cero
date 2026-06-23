# Proyecto 07: Renderizado de Listas

> **Concepto**: `.map()`, `key`, filtros, listas anidadas

---

## 📖 Nota Académica

### El problema: JSX no tiene loops

JSX no tiene sintaxis para loops. No podés escribir esto:

```jsx
❌ <for let i = 0; i < 10; i++> ... </for>
❌ <while condicion> ... </while>
```

JSX solo acepta **expresiones** (lo vimos en el proyecto 02). Un `for` o `while` son **sentencias** y no producen un valor.

**La solución: `.map()`**

`.map()` es un método de los arrays en JavaScript. Recorre cada elemento y devuelve un **nuevo array** del mismo tamaño:

```js
const numeros = [1, 2, 3];
const duplicados = numeros.map(n => n * 2);
// duplicados → [2, 4, 6]
```

Y como `.map()` es **una expresión**, funciona dentro de JSX:

```jsx
const frutas = ['Manzana', 'Banana', 'Naranja'];

return (
  <ul>
    {frutas.map(fruta => (
      <li>{fruta}</li>
    ))}
  </ul>
);
```

**¿Qué pasa acá?**
1. `frutas.map(fruta => <li>{fruta}</li>)` recorre el array
2. Por cada fruta, devuelve un `<li>` con ese texto
3. El resultado es un array de elementos JSX: `[<li>Manzana</li>, <li>Banana</li>, <li>Naranja</li>]`
4. React sabe renderizar arrays de JSX automáticamente

### ¿Qué es `key` y por qué es necesaria?

Si ejecutás el código de arriba sin `key`, React te muestra una **advertencia** en la consola:

```
Warning: Each child in a list should have a unique "key" prop.
```

No es un error, pero ignorarlo causa problemas de rendimiento y bugs raros.

**`key` le da a React una IDENTIDAD para cada elemento de la lista.** Cuando la lista cambia (se agrega, elimina o reordena un elemento), React usa las `key` para determinar:

- Qué elementos son **nuevos** (no estaban antes) → los crea
- Qué elementos **cambiaron** → los actualiza
- Qué elementos **ya no están** → los elimina

Sin `key`, React usa el **índice** del array como key por defecto, lo que funciona mal cuando el orden cambia.

### Reglas de la `key`

1. **Única entre hermanos:** no hace falta que sea única en toda la app, solo dentro de la misma lista
2. **Estable:** no debe cambiar entre renders. No uses `Math.random()` ni `Date.now()` como key
3. **Predecible:** debe ser la misma en cada render para el mismo elemento

```jsx
// ✅ BIEN: id de la base de datos
{personas.map(p => <li key={p.id}>{p.nombre}</li>)}

// ✅ BIEN: string único generado de los datos
{productos.map(p => <li key={p.nombre}>{p.nombre}</li>)}

// ⚠️ ACEPTABLE: índice (solo si la lista es estática)
{items.map((item, index) => <li key={index}>{item}</li>)}

// ❌ MAL: Math.random() — cambia en cada render
{items.map(item => <li key={Math.random()}>{item}</li>)}
```

### `key` con índice: ¿cuándo está bien?

Usar el índice como `key` **funciona** si y solo si:
- La lista es **estática** (no se agregan, eliminan ni reordenan elementos)
- Los elementos no tienen **estado interno** (inputs, checkboxes)
- La lista no se **filtra** ni **reordena**

En la práctica, casi siempre conviene usar un `id` único.

```jsx
// ✅ Bien: lista estática de strings que no cambia
const colores = ['Rojo', 'Verde', 'Azul'];
{colores.map((c, i) => <li key={i}>{c}</li>)}

// ❌ Mal: el índice cambia cuando se elimina un elemento
// Si eliminás el primero, el que estaba en índice 1 pasa a 0
```

### El patrón filter + map

Muy común: primero **filtrás** los datos con `.filter()`, después los **transformás** a JSX con `.map()`.

```jsx
const productos = [...];
const [categoria, setCategoria] = useState('todas');

// 1. Filtrar
const filtrados = categoria === 'todas'
  ? productos
  : productos.filter(p => p.categoria === categoria);

// 2. Mapear (a JSX)
return (
  <ul>
    {filtrados.map(p => (
      <li key={p.id}>{p.nombre}</li>
    ))}
  </ul>
);
```

**¿Por qué separar filter y map?** Porque es más legible que `.filter().map()` encadenado, y además podés poner el filtrado en una variable con nombre descriptivo.

### Listas anidadas (map adentro de map)

Cuando tenés datos agrupados (categorías con items), necesitás dos `.map()`:

```jsx
const menu = [
  {
    titulo: 'Entradas',
    items: [
      { nombre: 'Ensalada', precio: 1200 },
      { nombre: 'Empanadas', precio: 1500 },
    ],
  },
  {
    titulo: 'Principales',
    items: [
      { nombre: 'Pasta', precio: 2200 },
    ],
  },
];

return (
  <div>
    {menu.map(categoria => (
      <div key={categoria.titulo}>
        <h3>{categoria.titulo}</h3>
        <ul>
          {categoria.items.map(item => (
            <li key={item.nombre}>{item.nombre}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
```

Cada `.map()` necesita su propia `key` — la del exterior para la categoría, la del interior para el item.

---

## 🛠️ Paso a Paso — Creá tu propio proyecto

### 1. Creá el proyecto

```bash
cd react_desde_0
npm create vite@latest 07-renderizado-listas -- --template react
cd 07-renderizado-listas
npm install
rm -rf src/App.jsx src/App.css src/index.css src/assets public
```

### 2. Escribí `src/main.jsx`

```jsx
import { createRoot } from 'react-dom/client';
import { useState } from 'react';

// =============================================================
// ¿Cómo se renderizan listas en React?
// =============================================================
// En JSX no hay `for`, `while`, ni nada parecido. JSX solo
// acepta EXPRESIONES.
//
// .map() es UNA EXPRESIÓN: recorre un array y devuelve un
// NUEVO array del mismo tamaño.
//
// En React, .map() devuelve un array de elementos JSX.
// React sabe renderizar arrays de JSX automáticamente.
// =============================================================

// -------------------------------------------------------------
// Componente 1: ListaStrings — .map() básico
// -------------------------------------------------------------
function ListaStrings() {
  const frutas = ['Manzana', 'Banana', 'Naranja', 'Uva', 'Pera'];

  return (
    <div>
      <h2>Lista de frutas</h2>
      <ul>
        {frutas.map((fruta) => (
          <li key={fruta}>{fruta}</li>
        ))}
      </ul>
    </div>
  );
}

// -------------------------------------------------------------
// Componente 2: ListaPersonas — .map() con objetos y key
// -------------------------------------------------------------
function ListaPersonas() {
  const personas = [
    { id: 1, nombre: 'Martina', edad: 28, rol: 'Ingeniera' },
    { id: 2, nombre: 'Carlos', edad: 35, rol: 'Diseñador' },
    { id: 3, nombre: 'Ana', edad: 24, rol: 'Programadora' },
    { id: 4, nombre: 'Pedro', edad: 42, rol: 'Arquitecto' },
  ];

  return (
    <div>
      <h2>Lista de personas</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Edad</th><th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {personas.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.edad}</td>
              <td>{p.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -------------------------------------------------------------
// Componente 3: ListaInteractiva — .map() + eventos + estado
// -------------------------------------------------------------
function ListaInteractiva() {
  const [tareas, setTareas] = useState([
    { id: 1, texto: 'Aprender .map()', completa: true },
    { id: 2, texto: 'Entender las keys', completa: true },
    { id: 3, texto: 'Practicar filtros', completa: false },
    { id: 4, texto: 'Hacer el proyecto solo', completa: false },
  ]);

  const eliminar = (id) => {
    setTareas(tareas.filter((t) => t.id !== id));
  };

  const toggle = (id) => {
    setTareas(
      tareas.map((t) =>
        t.id === id ? { ...t, completa: !t.completa } : t
      )
    );
  };

  return (
    <div>
      <h2>Lista interactiva</h2>
      <ul>
        {tareas.map((t) => (
          <li key={t.id}>
            <span onClick={() => toggle(t.id)}
              style={{
                textDecoration: t.completa ? 'line-through' : 'none',
                cursor: 'pointer',
              }}
            >
              {t.completa ? '✅' : '⬜'} {t.texto}
            </span>
            <button onClick={() => eliminar(t.id)} style={{ marginLeft: 8 }}>❌</button>
          </li>
        ))}
      </ul>
      <p>
        Total: {tareas.length} |
        Completas: {tareas.filter((t) => t.completa).length} |
        Pendientes: {tareas.filter((t) => !t.completa).length}
      </p>
    </div>
  );
}

// -------------------------------------------------------------
// Componente 4: ListaFiltrada — .filter() + .map()
// -------------------------------------------------------------
function ListaFiltrada() {
  const productos = [
    { id: 1, nombre: 'Mate', categoria: 'bebida', precio: 2500 },
    { id: 2, nombre: 'Termo', categoria: 'bebida', precio: 8500 },
    { id: 3, nombre: 'Mouse', categoria: 'tecnologia', precio: 4500 },
    { id: 4, nombre: 'Teclado', categoria: 'tecnologia', precio: 12000 },
    { id: 5, nombre: 'Cuaderno', categoria: 'oficina', precio: 800 },
    { id: 6, nombre: 'Bombilla', categoria: 'bebida', precio: 1500 },
  ];

  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  // 1. FILTRAR
  const productosFiltrados = productos.filter((p) => {
    if (categoria !== 'todas' && p.categoria !== categoria) return false;
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h2>Lista con filtros</h2>
      <div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="todas">Todas</option>
          <option value="bebida">Bebida</option>
          <option value="tecnologia">Tecnología</option>
          <option value="oficina">Oficina</option>
        </select>
        <input type="text" placeholder="Buscar..."
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          style={{ marginLeft: 16 }} />
      </div>

      {productosFiltrados.length === 0 ? (
        <p>🔍 No se encontraron productos.</p>
      ) : (
        <ul>
          {productosFiltrados.map((p) => (
            <li key={p.id}>
              {p.nombre} — ${p.precio}
              <span style={{ color: '#666', fontSize: '0.9em', marginLeft: 8 }}>
                ({p.categoria})
              </span>
            </li>
          ))}
        </ul>
      )}
      <p>Mostrando {productosFiltrados.length} de {productos.length} productos</p>
    </div>
  );
}

// -------------------------------------------------------------
// Componente 5: ListaAnidada — .map() adentro de .map()
// -------------------------------------------------------------
function ListaAnidada() {
  const menu = [
    {
      id: 'entradas', titulo: '🥗 Entradas',
      items: [
        { id: 'e1', nombre: 'Ensalada César', precio: 1200 },
        { id: 'e2', nombre: 'Bruschettas', precio: 900 },
        { id: 'e3', nombre: 'Empanadas (x6)', precio: 1500 },
      ],
    },
    {
      id: 'principales', titulo: '🍝 Platos principales',
      items: [
        { id: 'p1', nombre: 'Pasta Alfredo', precio: 2200 },
        { id: 'p2', nombre: 'Pizza Mozzarella', precio: 1800 },
        { id: 'p3', nombre: 'Milanesa con papas', precio: 2100 },
      ],
    },
    {
      id: 'postres', titulo: '🍨 Postres',
      items: [
        { id: 'd1', nombre: 'Flan', precio: 600 },
        { id: 'd2', nombre: 'Helado (2 bochas)', precio: 800 },
      ],
    },
  ];

  return (
    <div>
      <h2>Menú del día</h2>
      {menu.map((categoria) => (
        <div key={categoria.id}>
          <h3>{categoria.titulo}</h3>
          <ul>
            {categoria.items.map((item) => (
              <li key={item.id}>
                {item.nombre} — <strong>${item.precio}</strong>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// Componente 6: Demo — todos los ejemplos
// -------------------------------------------------------------
function Demo() {
  return (
    <>
      <h1>🎯 Renderizado de Listas</h1>
      <hr /><ListaStrings />
      <hr /><ListaPersonas />
      <hr /><ListaInteractiva />
      <hr /><ListaFiltrada />
      <hr /><ListaAnidada />
    </>
  );
}

// =============================================================
const root = createRoot(document.getElementById('root'));
root.render(<Demo />);
```

### 3. Iniciá el servidor

```bash
npm run dev
```

Abrí `http://localhost:5173`. Vas a ver:

- **ListaStrings:** frutas renderizadas con `.map()` — el ejemplo más simple
- **ListaPersonas:** tabla con objetos, key usando `id`
- **ListaInteractiva:** tareas que se eliminan (`.filter()`) y togglean (`.map()`)
- **ListaFiltrada:** combo + input de búsqueda, filter antes de map
- **ListaAnidada:** menú con categorías e items, `.map()` adentro de `.map()`

### 4. Experimentá

1. **Sacá la `key`** de la lista de frutas — abrí la consola y mirá la warning
2. **Usá `index` como key** en `ListaInteractiva` — después eliminá el primer elemento y mirá qué pasa (spoiler: bugs raros)
3. **Agregá un producto nuevo** a `ListaFiltrada` — se filtra solo
4. **Invertí el orden** de las tareas en `ListaInteractiva` — probá `.reverse()` antes del `.map()`
5. **Agregá un contador** a cada item de la lista interactiva con su propio estado — después cambiá la key a `index` y fijate qué pasa cuando eliminás uno

---

## 📄 Código Completo

### `package.json`

```json
{
  "name": "07-renderizado-listas",
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

### `index.html`

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>07 — Renderizado de Listas</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 🎯 Proyecto para hacer solo

Creá un proyecto NUEVO llamado `07-renderizado-listas-practica`.

### Consigna

Construí un **catálogo de películas** que se pueda filtrar, ordenar y buscar.

**Requisitos técnicos:**

1. Usá `npm create vite@latest` para crear el proyecto
2. Definí un array de objetos (películas) con al menos 10 películas. Cada película debe tener: `id`, `titulo`, `genero`, `año`, `rating` (1-10)
3. Mostrá las películas en una lista (o tabla) usando `.map()` con `key`
4. Agregá los siguientes filtros:
   - **Filtro por género:** un `<select>` con los géneros disponibles
   - **Búsqueda por título:** un `<input>` que filtre en vivo
   - **Filtro por rating mínimo:** un `<input type="range">` o un `<select>`
5. Agregá **ordenamiento:** un `<select>` para ordenar por título, año o rating

**Estructura sugerida:**

```jsx
function Catalogo() {
  const [genero, setGenero] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ratingMin, setRatingMin] = useState(0);
  const [orden, setOrden] = useState('titulo');

  const peliculas = [
    { id: 1, titulo: 'El Padrino', genero: 'drama', año: 1972, rating: 9.2 },
    { id: 2, titulo: 'Volver al Futuro', genero: 'ciencia-ficcion', año: 1985, rating: 8.5 },
    // ... al menos 8 más
  ];

  // 1. Filtrar
  const filtradas = peliculas.filter(p => {
    // Aplicar todos los filtros acá
  });

  // 2. Ordenar
  const ordenadas = [...filtradas].sort((a, b) => {
    // Ordenar según el criterio seleccionado
  });

  // 3. Mapear
  return (
    // ...
  );
}
```

**Extras (si querés ir más allá):**
- Agregá paginación (mostrar de a 5 películas)
- Permitir al usuario **agregar** una película nueva con un formulario
- Guardar las películas en `localStorage`
- Mostrar el rating con estrellas (★) en lugar de número

---

## 🧠 Resumen

| Concepto | Explicación breve |
|----------|-------------------|
| **`.map()`** | Transforma un array de datos en un array de JSX. |
| **`key`** | Le da identidad a cada elemento para que React sepa cuál cambió, se agregó o se eliminó. |
| **Reglas de key** | Única entre hermanos, estable, predecible. |
| **`index` como key** | Solo aceptable si la lista es estática y no tiene estado interno. |
| **`.filter()` + `.map()`** | Patrón común: primero filtrás datos, después los transformás a JSX. |
| **`.map()` anidado** | Un `.map()` para categorías, otro adentro para items de cada categoría. |
| **Estado derivado** | Total, pendientes, filtrados se calculan del estado existente, no necesitan `useState`. |

**En el próximo proyecto** vas a ver **renderizado condicional**: cómo mostrar u ocultar componentes según el estado, usando `&&`, ternarios y condicionales.
