import { NavLink } from "react-router";

function header(){
    return <nav>

         <header className="site-header">
            <div className="header-container">
                <a href="inicio.html" className="logo-link">
                    <span className="brand-title">LEVEL-UP <span>GAMER</span></span>
                </a>

                <nav className="main-nav" aria-label="Navegación principal">
                    <ul>
                    <NavLink to="Inicio">Inicio</NavLink>
                    <li><a href="Inicio#catalogo">Productos</a></li>
                    <NavLink to="Carrito">Carrito</NavLink>
                    </ul>
                </nav>

                <div className="user-actions">
                    <div id="auth-nav-container" className="auth-links">
                    <NavLink to="Login">Iniciar sesión</NavLink>
                    <NavLink to="Registro">Registrarse</NavLink>
                    </div>
                    <NavLink to="Carrito" className="cart-button cart-count">Carrito (0)</NavLink>
                </div>
             </div>
         </header>

    </nav>
}

export default header;