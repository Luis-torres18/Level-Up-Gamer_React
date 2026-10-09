import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';

import { getSession, logout, subscribe } from '../services/auth';

function Header() {
  const [usuario, setUsuario] = useState(getSession());

  useEffect(() => {
    // Mantiene el header sincronizado cuando se inicia o cierra sesión.
    const unsubscribe = subscribe(() => setUsuario(getSession()));
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/Inicio" className="logo-link">
          <span className="brand-title">
            LEVEL-UP <span>GAMER</span>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Navegación principal">
          <ul>
            <NavLink to="/Inicio">Inicio</NavLink>
            <li>
              <Link to="/Inicio#catalogo">Productos</Link>
            </li>
            <NavLink to="/Carrito">Carrito</NavLink>
          </ul>
        </nav>

        <div className="user-actions">
          <div id="auth-nav-container" className="auth-links">
            {usuario ? (
              <>
                <span className="auth-user">Hola, {usuario.nombre.split(' ')[0]}</span>
                <button type="button" className="auth-logout" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <NavLink to="/Login">Iniciar sesión</NavLink>
                <NavLink to="/Registro">Registrarse</NavLink>
              </>
            )}
          </div>
          <NavLink to="/Carrito" className="cart-button cart-count">
            Carrito (0)
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default Header;
