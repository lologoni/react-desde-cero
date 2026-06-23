/* ============================================================
   React desde 0 — Proyecto 12: Context API
   Concepto: createContext, Provider, useContext
   ============================================================
   Las props viajan de padre a hijo. Pero cuando tenés un
   componente que necesita un dato que está 5 niveles arriba,
   tenés que pasar la prop por cada nivel intermedio aunque
   esos componentes no lo necesiten.

   A eso se llama "prop drilling" y Context lo resuelve.
   ============================================================ */

import { createRoot } from 'react-dom/client';
import { useState, useContext, createContext } from 'react';

// =============================================================
// ¿Qué es Context?
// =============================================================
// Context es como un "conducto" que atraviesa todos los
// componentes sin tener que pasar props manualmente.
//
// Tres pasos:
// 1. createContext → crea el conducto
// 2. Provider → el componente que PROVEE el valor
// 3. useContext → el hook que CONSUME el valor
//
// Flujo:
//   <ThemeContext.Provider value={tema}>
//     <App />  ← cualquier componente adentro puede leer el tema
//   </ThemeContext.Provider>
//
// Sin Context: pasar tema por props → NavBar → UserMenu → Avatar
// Con Context: Avatar usa useContext(ThemeContext) directamente
// =============================================================

// =============================================================
// PASO 1: Crear los Contexts
// =============================================================

// ThemeContext: tema claro/oscuro
const ThemeContext = createContext(null);
// createContext(valorInicial) → el valorInicial se usa si un
// componente consume el context SIN tener un Provider arriba.

// UserContext: usuario actual
const UserContext = createContext(null);

// =============================================================
// PASO 2: Crear los Providers
// =============================================================

// ThemeProvider: provee el tema (claro/oscuro) y la función
// para cambiarlo. Así cualquier componente hijo puede leer
// el tema y cambiarlo.
function ThemeProvider({ children }) {
  const [tema, setTema] = useState('claro');

  const toggleTema = () => {
    setTema((t) => (t === 'claro' ? 'oscuro' : 'claro'));
  };

  const valorTema = {
    tema,
    toggleTema,
    colores: tema === 'claro'
      ? { fondo: '#fff', texto: '#333', card: '#f5f5f5', borde: '#ddd' }
      : { fondo: '#1a1a2e', texto: '#eee', card: '#16213e', borde: '#0f3460' },
  };

  return (
    <ThemeContext.Provider value={valorTema}>
      {children}
    </ThemeContext.Provider>
  );
}

// UserProvider: provee el usuario actual y funciones de login
function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const login = (nombre) => {
    setUsuario({ nombre, email: `${nombre.toLowerCase()}@ejemplo.com`, rol: 'usuario' });
  };

  const logout = () => {
    setUsuario(null);
  };

  return (
    <UserContext.Provider value={{ usuario, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// =============================================================
// PASO 3: Consumir los Contexts con useContext
// =============================================================

// Componentes que usan useContext en lugar de recibir props.

// -------------------------------------------------------------
// Componente: Navbar
// -------------------------------------------------------------
// Usa AMBOS contexts: tema (para los estilos) y usuario (para
// mostrar login/logout). Sin context, estas props tendrían que
// viajar desde App hasta Navbar atravesando componentes.
function Navbar() {
  const { usuario, login, logout } = useContext(UserContext);
  const { colores, toggleTema } = useContext(ThemeContext);

  return (
    <nav style={{
      background: colores.card,
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `2px solid ${colores.borde}`,
      color: colores.texto,
    }}>
      <h3 style={{ margin: 0 }}>🎨 Context App</h3>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={toggleTema}>
          {colores.fondo === '#fff' ? '🌙 Modo oscuro' : '☀️ Modo claro'}
        </button>

        {usuario ? (
          <span>
            👋 {usuario.nombre}
            <button onClick={logout} style={{ marginLeft: 8 }}>Salir</button>
          </span>
        ) : (
          <button onClick={() => login('Martina')}>Iniciar sesión</button>
        )}
      </div>
    </nav>
  );
}

// -------------------------------------------------------------
// Componente: PerfilCard
// -------------------------------------------------------------
// Este componente está DENTRO de MainContent, que está DENTRO
// de App, que está DENTRO de los Providers. Pero accede al
// usuario DIRECTAMENTE con useContext, sin props intermedias.
function PerfilCard() {
  const { usuario } = useContext(UserContext);

  // Estilo: usa ThemeContext para los colores
  const { colores } = useContext(ThemeContext);

  return (
    <div style={{
      background: colores.card,
      color: colores.texto,
      border: `1px solid ${colores.borde}`,
      borderRadius: 12,
      padding: 20,
      textAlign: 'center',
    }}>
      {usuario ? (
        <>
          <div style={{ fontSize: '3em' }}>👤</div>
          <h2>{usuario.nombre}</h2>
          <p>📧 {usuario.email}</p>
          <p>🔑 Rol: {usuario.rol}</p>
        </>
      ) : (
        <>
          <div style={{ fontSize: '3em' }}>👻</div>
          <h2>Invitado</h2>
          <p>Iniciá sesión para ver tu perfil</p>
        </>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Componente: InfoBox
// -------------------------------------------------------------
// Otro componente anidado que usa el tema directamente.
function InfoBox() {
  const { colores } = useContext(ThemeContext);

  return (
    <div style={{
      background: colores.card,
      color: colores.texto,
      border: `1px solid ${colores.borde}`,
      borderRadius: 12,
      padding: 20,
      marginTop: 16,
      fontSize: '0.95em',
    }}>
      <h3>📖 ¿Qué está pasando acá?</h3>
      <ul>
        <li><strong>ThemeContext</strong> provee el tema (claro/oscuro) a TODOS los componentes de adentro</li>
        <li><strong>UserContext</strong> provee el usuario a TODOS los componentes de adentro</li>
        <li><strong>Navbar</strong> y <strong>PerfilCard</strong> usan useContext, no reciben props</li>
        <li>No hay "prop drilling": ningún componente intermedio necesita saber de estos datos</li>
      </ul>
    </div>
  );
}

// -------------------------------------------------------------
// Componente: MainContent
// -------------------------------------------------------------
// Este componente NO recibe props de usuario ni de tema.
// Solo organiza el diseño. Los datos los consumen los
// componentes anidados directamente con useContext.
function MainContent() {
  const { colores } = useContext(ThemeContext);

  return (
    <main style={{
      background: colores.fondo,
      color: colores.texto,
      minHeight: 'calc(100vh - 60px)',
      padding: 20,
      transition: 'background 0.3s, color 0.3s',
    }}>
      <h1>🎯 Context API</h1>
      <p>Todos los componentes de abajo usan <code>useContext</code>.
        Ninguno recibe props.</p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <PerfilCard />
          <InfoBox />
        </div>
        <div style={{ flex: 1, minWidth: 250 }}>
          <DatosContext />
        </div>
      </div>
    </main>
  );
}

// -------------------------------------------------------------
// Componente: DatosContext
// -------------------------------------------------------------
// Muestra los valores actuales de los contexts para
// entender qué contiene cada uno.
function DatosContext() {
  const { tema, colores } = useContext(ThemeContext);
  const { usuario } = useContext(UserContext);

  return (
    <div style={{
      background: colores.card,
      color: colores.texto,
      border: `1px solid ${colores.borde}`,
      borderRadius: 12,
      padding: 20,
    }}>
      <h3>🔍 Estado de los Contexts</h3>

      <div style={{ marginBottom: 12 }}>
        <h4>ThemeContext:</h4>
        <pre style={{
          background: colores.fondo,
          padding: 8,
          borderRadius: 6,
          fontSize: '0.85em',
        }}>
{JSON.stringify({ tema, colores }, null, 2)}
        </pre>
      </div>

      <div>
        <h4>UserContext:</h4>
        <pre style={{
          background: colores.fondo,
          padding: 8,
          borderRadius: 6,
          fontSize: '0.85em',
        }}>
{JSON.stringify({ usuario }, null, 2)}
        </pre>
      </div>

      <button onClick={() => {
        // Esto abre una mini ventana que muestra en detalle
        alert(`ThemeContext:\n${JSON.stringify({ tema }, null, 2)}\n\nUserContext:\n${JSON.stringify({ usuario }, null, 2)}`);
      }}>
        📋 Ver en alerta
      </button>
    </div>
  );
}

// =============================================================
// App: se envuelve con los Providers
// =============================================================
// Este es el PATRÓN: el App (o un layout wrapper) envuelve
// todo con los Providers. Cualquier componente adentro puede
// usar useContext() para acceder a los valores.
//
// Sin este paso, useContext no funciona porque no hay un
// Provider que esté proveyendo el valor.
function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        {/* Navbar está fuera de MainContent pero DENTRO de
             los Providers, así que también puede usar useContext */}
        <Navbar />
        <MainContent />
      </UserProvider>
    </ThemeProvider>
  );
}

// =============================================================
// Renderizado
// =============================================================
const root = createRoot(document.getElementById('root'));
root.render(<App />);
