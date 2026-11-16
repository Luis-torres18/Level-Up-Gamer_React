import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import '/src/index.css';
import { loginUser } from '../services/auth';
import { validarCorreo } from '../utils/validaciones';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const registroExitoso = location.state?.registrado ?? false;

  const [form, setForm] = useState({
    correo: location.state?.correo ?? '',
    contrasena: '',
  });
  const [errores, setErrores] = useState({});

  const [cargando, setCargando] = useState(false);

  const [alerta, setAlerta] = useState(() => {
    if (registroExitoso) {
      return { tipo: 'success', texto: '¡Cuenta creada con éxito! Ahora puedes iniciar sesión.' };
    }
    if (location.state?.aviso) return { tipo: 'error', texto: location.state.aviso };
    return null;
  });

  const validarCampo = (campo, valor) => {
    switch (campo) {
      case 'correo':
        return validarCorreo(valor);
      case 'contrasena':
        if (!valor) return 'La contraseña es obligatoria.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
    if (alerta?.tipo === 'error') setAlerta(null);
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cargando) return;

    const nuevosErrores = {
      correo: validarCampo('correo', form.correo),
      contrasena: validarCampo('contrasena', form.contrasena),
    };
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some((error) => error)) return;

    setCargando(true);
    const resultado = await loginUser(form.correo, form.contrasena);
    setCargando(false);

    if (!resultado.ok) {
      setAlerta({ tipo: 'error', texto: resultado.error });
      return;
    }

    // Si venía de una página protegida, vuelve a ella; si no, al inicio.
    navigate(location.state?.desde ?? '/Inicio', { replace: true });
  };

  const claseInput = (campo) => (errores[campo] ? 'input-error' : '');

  return (
    <main className="form-page-main">
      <section className="form-wrapper">
        <div className="form-header">
          <h1>INICIO DE SESIÓN</h1>
          <p>Accede con tus credenciales registradas</p>
        </div>

        <form id="form-login" noValidate onSubmit={handleSubmit}>
          {alerta && (
            <p
              className={`form-alert ${
                alerta.tipo === 'success' ? 'form-alert-success' : 'form-alert-error'
              }`}
            >
              {alerta.texto}
            </p>
          )}

          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              placeholder="ejemplo@correo.cl"
              value={form.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              className={claseInput('correo')}
              aria-invalid={Boolean(errores.correo)}
            />
            <span className="form-hint">
              Correo con el cual te registraste en la plataforma.
            </span>
            <span id="error-correo" className="error-message">
              {errores.correo}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              placeholder="••••••••"
              value={form.contrasena}
              onChange={handleChange}
              onBlur={handleBlur}
              className={claseInput('contrasena')}
              aria-invalid={Boolean(errores.contrasena)}
            />
            <span className="form-hint">Ingresa tu clave de acceso.</span>
            <span id="error-contrasena" className="error-message">
              {errores.contrasena}
            </span>
          </div>

          <button type="submit" className="btn-submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar a mi cuenta'}
          </button>

          <p className="form-footer-link">
            ¿Aún no tienes cuenta? <Link to="/Registro">Crea una cuenta aquí</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
