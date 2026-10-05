import { NavLink, Link } from 'react-router-dom';

function Nav({ cartCount = 0 }) {
  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo de la marca */}
        <Link to="/" className="logo-link">
          <span className="brand-title">
            LEVEL-UP <span>GAMER</span>
          </span>
        </Link>

        {/* Navegación de páginas */}
        <nav className="main-nav" aria-label="Navegación principal">
          <ul>
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => (isActive ? 'active' : '')} 
                end
              >
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/productos" 
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Productos
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/carrito" 
                className={({ isActive }) => (isActive ? 'active' : '')}>
                Carrito
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Acciones de usuario */}
        <div className="user-actions">
          <div id="auth-nav-container" className="auth-links">
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro">Registrarse</Link>
          </div>
          <Link to="/carrito" className="cart-button cart-count">
            Carrito ({cartCount})
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Nav;