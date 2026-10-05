import Header from "../Components/Header";
import '/src/index.css'

function login(){

    return<>
    
        <header></header>
        <main class="form-page-main">
            <section class="form-wrapper">
            <div class="form-header">
                <h1>INICIO DE SESIÓN</h1>
                <p>Accede con tus credenciales registradas</p>
            </div>

            <form id="form-login" novalidate>
                <div class="form-group">
                <label for="correo">Correo Electrónico</label>
                <input type="email" id="correo" name="correo" placeholder="ejemplo@correo.cl"/>
                <span class="form-hint">Correo con el cual te registraste en la plataforma.</span>
                <span id="error-correo" class="error-message"></span>
                </div>

                <div class="form-group">
                <label for="contrasena">Contraseña</label>
                <input type="password" id="contrasena" name="contrasena" placeholder="••••••••"/>
                <span class="form-hint">Ingresa tu clave de acceso.</span>
                <span id="error-contrasena" class="error-message"></span>
                </div>

                <button type="submit" class="btn-submit">Ingresar a mi cuenta</button>

                <p class="form-footer-link">
                ¿Aún no tienes cuenta? <a href="registro.html">Crea una cuenta aquí</a>
                </p>
            </form>
            </section>
        </main>
    </>
}

export default login;