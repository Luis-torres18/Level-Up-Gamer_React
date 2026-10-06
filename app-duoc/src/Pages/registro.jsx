import '/src/index.css'

function Registro(){

    return<>

        <main class="form-page-main">
            <section class="form-wrapper">
            <div class="form-header">
                <h1>REGISTRO DE USUARIO</h1>
                <p>Crea tu cuenta y aprovecha un 20% de descuento si eres estudiante o docente Duoc UC.</p>
            </div>

            <form id="form-registro" novalidate>

            <div class="form-group">
            <label for="nombre">Nombre Completo</label>
            <input type="text" id="nombre" name="nombre" placeholder="Ej: Ignacio Morales"/>
            <span class="form-hint">Solo letras y espacios. Máximo 50 caracteres.</span>
            <span id="error-nombre" class="error-message"></span>
            </div>

            <div class="form-group">
            <label for="correo">Correo Electrónico</label>
            <input type="email" id="correo" name="correo" placeholder="ejemplo@correo.cl"/>
            <span class="form-hint">Usa tu correo @duoc.cl para descuento automático de por vida.</span>
            <span id="error-correo" class="error-message"></span>
            </div>

            <div class="form-group">
            <label for="confirmar-correo">Confirmar Correo Electrónico</label>
            <input type="email" id="confirmar-correo" name="confirmar-correo" placeholder="Reescribe tu correo"/>
            <span class="form-hint">Debe ser idéntico al correo ingresado arriba.</span>
            <span id="error-confirmar-correo" class="error-message"></span>
            </div>

            <div class="form-row">
            <div class="form-group">
                <label for="contrasena">Contraseña</label>
                <input type="password" id="contrasena" name="contrasena"/>
                <span class="form-hint">Mínimo 8 caracteres, 1 mayús, 1 minús, 1 num y 1 símbolo.</span>
                <span id="error-contrasena" class="error-message"></span>
            </div>

            <div class="form-group">
                <label for="confirmar-contrasena">Confirmar Contraseña</label>
                <input type="password" id="confirmar-contrasena" name="confirmar-contrasena"/>
                <span class="form-hint">Vuelve a ingresar la contraseña.</span>
                <span id="error-confirmar-contrasena" class="error-message"></span>
            </div>
            </div>

            <div class="form-group">
            <label for="telefono">Teléfono (Opcional)</label>
            <input type="tel" id="telefono" name="telefono" placeholder="+56 9 1234 5678"/>
            <span class="form-hint">Formato chileno (+56 9 XXXX XXXX o 9XXXXXXXX).</span>
            <span id="error-telefono" class="error-message"></span>
            </div>

            <div class="form-row">
            <div class="form-group">
                <label for="region">Región</label>
                <select id="region" name="region">
                <option value="">Cargando regiones...</option>
                </select>
                <span class="form-hint">Seleccione su región de residencia.</span>
                <span id="error-region" class="error-message"></span>
            </div>

            <div class="form-group">
                <label for="comuna">Comuna</label>
                <select id="comuna" name="comuna" disabled>
                <option value="">-- Primero elija una región --</option>
                </select>
                <span class="form-hint">Comuna para cálculo de despacho.</span>
                <span id="error-comuna" class="error-message"></span>
            </div>
            </div>

            <button type="submit" class="btn-submit">Registrarse</button>

            <p class="form-footer-link">
            ¿Ya posees una cuenta? <a href="login.html">Inicia sesión aquí</a>
            </p>
            </form>
            </section>
        </main>

    </>
}

export default Registro;