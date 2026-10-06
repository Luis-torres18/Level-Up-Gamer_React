import Footer from "../Components/Footer";
import Header from "../Components/Header";
import '/src/index.css'

function login(){

    return<>
    
        <Header/>

        <main className="form-page-main">
            <section className="form-wrapper">
            <div className="form-header">
                <h1>INICIO DE SESIÓN</h1>
                <p>Accede con tus credenciales registradas</p>
            </div>

            <form id="form-login" novalidate>
                <div className="form-group">
                <label for="correo">Correo Electrónico</label>
                <input type="email" id="correo" nameName="correo" placeholder="ejemplo@correo.cl"/>
                <span className="form-hint">Correo con el cual te registraste en la plataforma.</span>
                <span id="error-correo" className="error-message"></span>
                </div>

                <div className="form-group">
                <label for="contrasena">Contraseña</label>
                <input type="password" id="contrasena" name="contrasena" placeholder="••••••••"/>
                <span className="form-hint">Ingresa tu clave de acceso.</span>
                <span id="error-contrasena" className="error-message"></span>
                </div>

                <button type="submit" className="btn-submit">Ingresar a mi cuenta</button>

                <p className="form-footer-link">
                ¿Aún no tienes cuenta? <a href="registro.html">Crea una cuenta aquí</a>
                </p>
            </form>
            </section>
        </main>

        <Footer/>
    </>
}

export default login;