# React desde 0

Curso práctico de React. **Un concepto por proyecto, sin mezclar nada**.

## Filosofía

Cada proyecto explica **exactamente un concepto nuevo**. No hay atajos, no hay "mágia".
Si el proyecto 4 enseña `props`, el proyecto 3 NO las usa. Simple, progresivo, sólido.

```
Proyecto N → Enseña concepto X
Proyecto N+1 → Enseña concepto Y (y repasa X sin explicarlo)
```

Aprendés React de abajo hacia arriba. No importa si venís de HTML/CSS/JS — esto arranca
con lo mínimo que necesitás para ver algo en pantalla.

## Proyectos

| #  | Proyecto              | Concepto                                    | Scaffolding | 🎯 Solo |
|----|-----------------------|---------------------------------------------|-------------|---------|
| 01 | hola-mundo            | JSX, `createRoot`, `render` — el mínimo     | Manual      | ❌      |
| 02 | jsx-expresiones       | Llaves `{}`, expresiones, fragments         | Manual      | ❌      |
| 03 | componentes           | Funciones que devuelven JSX                 | Manual      | ❌      |
| 04 | props                 | Props, `children`, valores por defecto      | Vite        | ✅      |
| 05 | estado                | `useState` — la gran diferencia con HTML    | Vite        | ✅      |
| 06 | eventos               | `onClick`, `onChange`, `onSubmit`           | Vite        | ✅      |
| 07 | renderizado-listas    | `.map()`, `key`                             | Vite        | ✅      |
| 08 | renderizado-condicional | `&&`, ternario, early return              | Vite        | ✅      |
| 09 | formularios           | Controlled components, validación           | Vite        | ✅      |
| 10 | useEffect             | Side effects, fetch, cleanup, AbortController | Vite      | ✅      |
| 11 | useRef                | Referencias al DOM, valores sin re-render   | Vite        | ✅      |
| 12 | context               | Context API, `createContext`, `useContext`   | Vite        | ✅      |
| 13 | custom-hooks          | Extraer lógica reusable en hooks propios    | Vite        | ✅      |
| 14 | react-router          | SPA, `BrowserRouter`, `useParams`           | Vite        | ✅      |
| 15 | hooks-avanzados       | `useReducer`, `useCallback`, `useMemo`, `useId`, `useTransition`, `useDeferredValue` | Vite | ✅ |
| 16 | api-conexion          | Fetch API, CRUD, loading/error states, AbortController, variables de entorno | Vite | ✅ |

## Cómo usar este curso

Cada proyecto es **independiente** con su propio `package.json`:

```bash
cd 04-props        # o cualquier módulo del 04 en adelante
npm install
npm run dev
```

Eso es todo. No necesitás nada más que un navegador y un editor de código.

**Nota:** Los proyectos 01-03 se crearon **manualmente** (escribiendo `package.json` a mano) para entender la configuración desde cero. A partir del proyecto 04 usamos `npm create vite@latest` para scaffolding automático.

### Estructura de cada proyecto

**Proyectos 01-03 (manuales):**
```
N-concepto/
├── README.md          ← LEÉ ESTO PRIMERO
│                       - 📖 Nota Académica
│                       - 🛠️ Paso a Paso
│                       - 📄 Código completo
├── src/main.jsx       ← Código con comentarios didácticos
├── index.html
├── package.json
└── vite.config.js
```

**Proyectos 04-16 (Vite scaffold + 🎯 proyecto solo):**
```
N-concepto/
├── README.md          ← LEÉ ESTO PRIMERO
│                       - 📖 Nota Académica
│                       - 🛠️ Paso a Paso (incluye npm create vite)
│                       - 📄 Código completo
│                       - 🎯 Proyecto para hacer solo
├── src/
│   ├── main.jsx       ← Código con comentarios didácticos
│   └── hooks/         ← Proyectos 13 (custom hooks) y 16 (useApi)
├── .env               ← Solo proyecto 16 (variables de entorno)
├── index.html
├── package.json
└── vite.config.js
```

### Cómo estudiar cada proyecto

1. **Leé el README.md** — entendé el concepto con la Nota Académica
2. **Seguí el Paso a Paso** — creá tu propio proyecto desde cero, sin copiar
3. **Compará con `src/main.jsx`** — si te trabás, el código comentado te guía
4. **Experimentá** — cambiá algo, rompelo, arreglalo. Eso es aprender.
5. **(Del 04 en adelante) Hacé el 🎯 Proyecto para hacer solo** — no es opcional. Es la única forma de que el concepto te quede grabado.

**NO copies y pegues**. Escribí cada línea. Rompela, fixeala, entende qué pasa.
Esa es la única forma de aprender de verdad.

## Prerrequisitos

- Node.js 18+ (instalado)
- Navegador moderno (Chrome, Firefox, Edge)
- Editor de código (VS Code recomendado)
- Ganas de **entender**, no de copiar

---

## 📋 Nota sobre el propósito del curso

Este curso está diseñado exclusivamente para aquellos estudiantes que deseen **adquirir competencia en desarrollo React** con el objetivo de **mejorar su perfil profesional**. No constituye una obligación académica, no tiene fecha de entrega ni vencimiento, y su ritmo de avance es determinado únicamente por cada estudiante en función de su disponibilidad y dedicación.

El material se encuentra estructurado de forma progresiva y acumulativa: cada proyecto introduce un concepto nuevo y presupone el dominio de los conceptos anteriores. Se recomienda completar los proyectos en orden secuencial y realizar los ejercicios prácticos propuestos (🎯 Proyecto para hacer solo) antes de avanzar al siguiente módulo.

La meta no es "terminar el curso", sino **desarrollar la capacidad de construir aplicaciones React de forma autónoma**, comprendiendo los fundamentos y las decisiones de diseño detrás de cada herramienta.
