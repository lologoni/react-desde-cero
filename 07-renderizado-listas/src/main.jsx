/* ============================================================
   React desde 0 — Proyecto 07: Renderizado de Listas
   Concepto: .map(), key, filtros, listas anidadas
   ============================================================
   JSX no tiene loops. No podés hacer <for> ni <while>.
   La única forma de renderizar listas en React es con
   .map(): transformás un array de DATOS en un array de JSX.
   ============================================================ */

import { createRoot } from 'react-dom/client';
import { useState } from 'react';

// =============================================================
// ¿Cómo se renderizan listas en React?
// =============================================================
// En JSX no hay `for`, `while`, ni nada parecido. JSX solo
// acepta EXPRESIONES (lo vimos en el proyecto 02).
//
// .map() es UNA EXPRESIÓN: recorre un array y devuelve un
// NUEVO array del mismo tamaño.
//
//   const numeros = [1, 2, 3];
//   const duplicados = numeros.map(n => n * 2);
//   // duplicados → [2, 4, 6]
//
// En React, .map() devuelve un array de elementos JSX:
//
//   numeros.map(n => <li>{n}</li>)
//   // → [<li>1</li>, <li>2</li>, <li>3</li>]
//
// Y React sabe renderizar arrays de JSX automáticamente.
// =============================================================

// -------------------------------------------------------------
// Componente 1: ListaStrings — .map() básico
// -------------------------------------------------------------
// El caso más simple: un array de strings a etiquetas <li>.
function ListaStrings() {
  const frutas = ['Manzana', 'Banana', 'Naranja', 'Uva', 'Pera'];

  return (
    <div>
      <h2>Lista de frutas</h2>

      {/* .map() recorre el array y por cada elemento (fruta)
           devuelve un <li> con ese texto. El resultado es un
           array de <li> que React renderiza. */}
      <ul>
        {frutas.map((fruta) => (
          <li key={fruta}>{fruta}</li>
        ))}
      </ul>

      {/* Si querés ver qué produce .map(), podés hacer:
           console.log(frutas.map(f => <li>{f}</li>))
           → [<li>Manzana</li>, <li>Banana</li>, ...] */}

      <p><strong>key={fruta}:</strong> usamos la fruta misma como
      key porque es única dentro de la lista.</p>
    </div>
  );
}

// -------------------------------------------------------------
// Componente 2: ListaPersonas — .map() con objetos y key
// -------------------------------------------------------------
// Con objetos, la key suele ser el id único (de la DB, o
// generado con Date.now(), crypto.randomUUID(), etc.).
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

      {/* .map() devuelve un array de JSX. La key va en el
           elemento RAÍZ de lo que devuelve .map().
           key DEBE ser: única entre hermanos y estable. */}
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
// Acá combinamos .map() con useState. Podemos eliminar,
// toggle, y modificar elementos de la lista.
function ListaInteractiva() {
  // Estado: array de objetos con id, texto, completa
  const [tareas, setTareas] = useState([
    { id: 1, texto: 'Aprender .map()', completa: true },
    { id: 2, texto: 'Entender las keys', completa: true },
    { id: 3, texto: 'Practicar filtros', completa: false },
    { id: 4, texto: 'Hacer el proyecto solo', completa: false },
  ]);

  // Eliminar: .filter() devuelve un NUEVO array sin el elemento
  const eliminar = (id) => {
    setTareas(tareas.filter((t) => t.id !== id));
  };

  // Toggle: .map() devuelve un NUEVO array con el elemento modificado
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

      {/* La key está en el elemento raíz del .map(), o sea <li>.
           Si sacás la key, React tira una WARNING en la consola.
           No es un error, pero es una MALA PRÁCTICA. */}
      <ul>
        {tareas.map((t) => (
          <li key={t.id}>
            <span
              onClick={() => toggle(t.id)}
              style={{
                textDecoration: t.completa ? 'line-through' : 'none',
                cursor: 'pointer',
              }}
            >
              {t.completa ? '✅' : '⬜'} {t.texto}
            </span>
            <button onClick={() => eliminar(t.id)} style={{ marginLeft: 8 }}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      {/* Estado derivado: calculamos estos valores a partir
           del array tareas, sin useState adicional. */}
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
// Filtrar antes de mapear es un patrón muy común.
// Primero filtrás los datos, después los transformás a JSX.
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

  // 1. FILTRAR: aplicamos los filtros activos
  const productosFiltrados = productos.filter((p) => {
    // Filtro por categoría
    if (categoria !== 'todas' && p.categoria !== categoria) return false;
    // Filtro por texto de búsqueda
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }
    return true;
  });

  // 2. MAPEAR: transformamos el resultado a JSX
  // Notá que separamos el filtrado del mapeo en DOS pasos.
  // Es más legible que hacer .filter().map() encadenado.

  return (
    <div>
      <h2>Lista con filtros</h2>

      {/* Filtros */}
      <div>
        <label>Categoría: </label>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="todas">Todas</option>
          <option value="bebida">Bebida</option>
          <option value="tecnologia">Tecnología</option>
          <option value="oficina">Oficina</option>
        </select>

        <span style={{ marginLeft: 16 }}>
          <label>Buscar: </label>
          <input
            type="text"
            placeholder="Filtrar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </span>
      </div>

      {/* Resultados */}
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
// A veces tenés datos agrupados: categorías que contienen items.
// La solución es .map() anidado: uno para categorías, otro
// para los items de cada categoría.
function ListaAnidada() {
  const menu = [
    {
      id: 'entradas',
      titulo: '🥗 Entradas',
      items: [
        { id: 'e1', nombre: 'Ensalada César', precio: 1200 },
        { id: 'e2', nombre: 'Bruschettas', precio: 900 },
        { id: 'e3', nombre: 'Empanadas (x6)', precio: 1500 },
      ],
    },
    {
      id: 'principales',
      titulo: '🍝 Platos principales',
      items: [
        { id: 'p1', nombre: 'Pasta Alfredo', precio: 2200 },
        { id: 'p2', nombre: 'Pizza Mozzarella', precio: 1800 },
        { id: 'p3', nombre: 'Milanesa con papas', precio: 2100 },
      ],
    },
    {
      id: 'postres',
      titulo: '🍨 Postres',
      items: [
        { id: 'd1', nombre: 'Flan', precio: 600 },
        { id: 'd2', nombre: 'Helado (2 bochas)', precio: 800 },
      ],
    },
  ];

  return (
    <div>
      <h2>Menú del día (listas anidadas)</h2>

      {/* .map() exterior: recorre las categorías */}
      {menu.map((categoria) => (
        <div key={categoria.id}>
          <h3>{categoria.titulo}</h3>
          <ul>
            {/* .map() interior: recorre los items de CADA categoría */}
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
      <p>
        Todos los componentes abajo usan <code>.map()</code> para
        transformar datos en JSX.
      </p>

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
