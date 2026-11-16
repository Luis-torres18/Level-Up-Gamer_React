import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useSyncExternalStore } from 'react';

import { getSession, logout, subscribe, esRolAdmin } from '../services/auth';
import { contarCarrito, subscribeCarrito } from '../services/carrito';

// Ícono de usuario (silueta) dibujado en SVG para no depender de librerías externas.
function UserIcon() {
  return (
    <svg
      className="user-menu-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function Header() {
  const [usuario, setUsuario] = useState(getSession());
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const botonMenuRef = useRef(null);
  const totalCarrito = useSyncExternalStore(subscribeCarrito, contarCarrito);

  useEffect(() => {
    const unsubscribe = subscribe(() => setUsuario(getSession()));
    return unsubscribe;
  }, []);

  // Cierra el menú al hacer clic fuera de él o al presionar Escape.
  useEffect(() => {
    if (!menuAbierto) return undefined;

    const handleClickFuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };

    const handleTecla = (event) => {
      if (event.key === 'Escape') {
        setMenuAbierto(false);
        botonMenuRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    document.addEventListener('keydown', handleTecla);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
      document.removeEventListener('keydown', handleTecla);
    };
  }, [menuAbierto]);

  const toggleMenu = () => setMenuAbierto((abierto) => !abierto);
  const cerrarMenu = () => setMenuAbierto(false);

  const handleLogout = () => {
    logout();
    cerrarMenu();
  };

  const primerNombre = usuario?.nombre?.split(' ')[0] ?? '';

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
              <a href="#catalogo">Productos</a>
            </li>
            <NavLink to="/Carrito">Carrito</NavLink>
            {esRolAdmin(usuario) && <NavLink to="/Admin/Usuarios">Administración</NavLink>}
          </ul>
        </nav>

        <div className="user-actions">
          <div id="auth-nav-container" className="user-menu" ref={menuRef}>
            <button
              type="button"
              ref={botonMenuRef}
              className={`user-menu-toggle${usuario ? ' is-logged' : ''}`}
              onClick={toggleMenu}
              aria-haspopup="true"
              aria-expanded={menuAbierto}
              aria-controls="user-menu-dropdown"
              aria-label={usuario ? `Menú de usuario de ${primerNombre}` : 'Menú de usuario'}
              title={usuario ? `Hola, ${primerNombre}` : 'Mi cuenta'}
            >
              <UserIcon />
            </button>

            {menuAbierto && (
              <div id="user-menu-dropdown" className="user-menu-dropdown">
                {usuario ? (
                  <>
                    <div className="user-menu-header">
                      <span className="user-menu-greeting">Hola, {primerNombre}</span>
                      <span className="user-menu-email">{usuario.correo}</span>
                      <span className={`rol-badge rol-${String(usuario.rol).toLowerCase()}`}>
                        {usuario.rol}
                      </span>
                    </div>
                    {esRolAdmin(usuario) && (
                      <NavLink
                        to="/Admin/Usuarios"
                        className="user-menu-item"
                        onClick={cerrarMenu}
                      >
                        Gestionar usuarios
                      </NavLink>
                    )}
                    <button
                      type="button"
                      className="user-menu-item user-menu-logout"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/Login" className="user-menu-item" onClick={cerrarMenu}>
                      Iniciar sesión
                    </NavLink>
                    <NavLink to="/Registro" className="user-menu-item" onClick={cerrarMenu}>
                      Registrarse
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>

          <NavLink to="/Carrito" className="cart-button cart-count">
            Carrito ({totalCarrito})
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default Header;
