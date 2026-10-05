function header(){
    return <header class="site-header">
        <div class="header-container">
        <a href="inicio.html" class="logo-link">
            <span class="brand-title">LEVEL-UP <span>GAMER</span></span>
        </a>

        <nav class="main-nav" aria-label="Navegación principal">
            <ul>
            <li><a href="inicio.html" class="active">Inicio</a></li>
            <li><a href="inicio.html#catalogo">Productos</a></li>
            <li><a href="carrito.html">Carrito</a></li>
            </ul>
        </nav>

        <div class="user-actions">
            <div id="auth-nav-container" class="auth-links">
            <a href="login.html">Iniciar sesión</a> 
            <a href="registro.html">Registrarse</a>
            </div>
            <a href="carrito.html" class="cart-button cart-count">Carrito (0)</a>
        </div>
        </div>
    </header>
}

export default header;