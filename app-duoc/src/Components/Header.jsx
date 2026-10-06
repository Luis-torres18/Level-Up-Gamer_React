function header(){
    return <header className="site-header">
        <div className="header-container">
            <a href="inicio.html" className="logo-link">
                <span className="brand-title">LEVEL-UP <span>GAMER</span></span>
            </a>

            <nav className="main-nav" aria-label="Navegación principal">
                <ul>
                <li><a href="inicio.html" className="active">Inicio</a></li>
                <li><a href="inicio.html#catalogo">Productos</a></li>
                <li><a href="carrito.html">Carrito</a></li>
                </ul>
            </nav>

            <div className="user-actions">
                <div id="auth-nav-container" className="auth-links">
                <a href="login.html">Iniciar sesión</a> 
                <a href="registro.html">Registrarse</a>
                </div>
                <a href="carrito.html" className="cart-button cart-count">Carrito (0)</a>
            </div>
        </div>
    </header>
}

export default header;