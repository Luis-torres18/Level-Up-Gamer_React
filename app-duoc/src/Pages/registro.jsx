import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import '/src/index.css';
import { REGIONES } from '../data/regiones';
import { registerUser } from '../services/auth';
import {
  validarNombre,
  validarCorreo,
  validarConfirmacionCorreo,
  validarContrasena,
  validarConfirmacionContrasena,
  validarTelefono,
  validarRegion,
  validarComuna,
} from '../utils/validaciones';

const ESTADO_INICIAL = {
  nombre: '',
  correo: '',
  confirmarCorreo: '',
  contrasena: '',
  confirmarContrasena: '',
  telefono: '',
  region: '',
  comuna: '',
};

const CAMPOS = [
  'nombre',
  'correo',
  'confirmarCorreo',
  'contrasena',
  'confirmarContrasena',
  'telefono',
  'region',
  'comuna',
];

function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');

  const comunasDisponibles = useMemo(() => {
    const seleccionada = REGIONES.find((item) => item.region === form.region);
    return seleccionada ? seleccionada.comunas : [];
  }, [form.region]);

  const validarCampo = (campo, valor) => {
    switch (campo) {
      case 'nombre':
        return validarNombre(valor);
      case 'correo':
        return validarCorreo(valor);
      case 'confirmarCorreo':
        return validarConfirmacionCorreo(valor, form.correo);
      case 'contrasena':
        return validarContrasena(valor);
      case 'confirmarContrasena':
        return validarConfirmacionContrasena(valor, form.contrasena);
      case 'telefono':
        return validarTelefono(valor);
      case 'region':
        return validarRegion(valor);
      case 'comuna':
        return validarComuna(valor);
      default:
        return '';
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      const siguiente = { ...prev, [name]: value };
      if (name === 'region') siguiente.comuna = '';
      return siguiente;
    });

    // Limpia el error del campo mientras el usuario escribe.
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setErrores((prev) => ({ ...prev, [name]: validarCampo(name, value) }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    CAMPOS.forEach((campo) => {
      nuevosErrores[campo] = validarCampo(campo, form[campo]);
    });
    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((error) => !error);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMensaje('');

    if (!validarFormulario()) return;

    const resultado = registerUser({
      nombre: form.nombre,
      correo: form.correo,
      contrasena: form.contrasena,
      telefono: form.telefono,
      region: form.region,
      comuna: form.comuna,
    });

    if (!resultado.ok) {
      setErrores((prev) => ({ ...prev, correo: resultado.error }));
      return;
    }

    // Redirige al login informando que el registro fue exitoso.
    navigate('/Login', {
      state: {
        registrado: true,
        correo: resultado.user.correo,
        descuentoDuoc: resultado.user.descuentoDuoc,
      },
    });
  };

  const claseInput = (campo) => (errores[campo] ? 'input-error' : '');

  return (
    <main className="form-page-main">
      <section className="form-wrapper">
        <div className="form-header">
          <h1>REGISTRO DE USUARIO</h1>
          <p>
            Crea tu cuenta y aprovecha un 20% de descuento si eres estudiante o docente
            Duoc UC.
          </p>
        </div>

        <form id="form-registro" noValidate onSubmit={handleSubmit}>
          {mensaje && <p className="form-alert form-alert-error">{mensaje}</p>}

          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              placeholder="Ej: Ignacio Morales"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              className={claseInput('nombre')}
              aria-invalid={Boolean(errores.nombre)}
            />
            <span className="form-hint">Solo letras y espacios. Máximo 50 caracteres.</span>
            <span id="error-nombre" className="error-message">
              {errores.nombre}
            </span>
          </div>

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
              Usa tu correo @duoc.cl para descuento automático de por vida.
            </span>
            <span id="error-correo" className="error-message">
              {errores.correo}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmar-correo">Confirmar Correo Electrónico</label>
            <input
              type="email"
              id="confirmar-correo"
              name="confirmarCorreo"
              placeholder="Reescribe tu correo"
              value={form.confirmarCorreo}
              onChange={handleChange}
              onBlur={handleBlur}
              className={claseInput('confirmarCorreo')}
              aria-invalid={Boolean(errores.confirmarCorreo)}
            />
            <span className="form-hint">Debe ser idéntico al correo ingresado arriba.</span>
            <span id="error-confirmar-correo" className="error-message">
              {errores.confirmarCorreo}
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contrasena">Contraseña</label>
              <input
                type="password"
                id="contrasena"
                name="contrasena"
                value={form.contrasena}
                onChange={handleChange}
                onBlur={handleBlur}
                className={claseInput('contrasena')}
                aria-invalid={Boolean(errores.contrasena)}
              />
              <span className="form-hint">
                Mínimo 8 caracteres, 1 mayús, 1 minús, 1 num y 1 símbolo.
              </span>
              <span id="error-contrasena" className="error-message">
                {errores.contrasena}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmar-contrasena">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmar-contrasena"
                name="confirmarContrasena"
                value={form.confirmarContrasena}
                onChange={handleChange}
                onBlur={handleBlur}
                className={claseInput('confirmarContrasena')}
                aria-invalid={Boolean(errores.confirmarContrasena)}
              />
              <span className="form-hint">Vuelve a ingresar la contraseña.</span>
              <span id="error-confirmar-contrasena" className="error-message">
                {errores.confirmarContrasena}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono (Opcional)</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              placeholder="+56 9 1234 5678"
              value={form.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              className={claseInput('telefono')}
              aria-invalid={Boolean(errores.telefono)}
            />
            <span className="form-hint">Formato chileno (+56 9 XXXX XXXX o 9XXXXXXXX).</span>
            <span id="error-telefono" className="error-message">
              {errores.telefono}
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="region">Región</label>
              <select
                id="region"
                name="region"
                value={form.region}
                onChange={handleChange}
                onBlur={handleBlur}
                className={claseInput('region')}
                aria-invalid={Boolean(errores.region)}
              >
                <option value="">Seleccione su región</option>
                {REGIONES.map((item) => (
                  <option key={item.region} value={item.region}>
                    {item.region}
                  </option>
                ))}
              </select>
              <span className="form-hint">Seleccione su región de residencia.</span>
              <span id="error-region" className="error-message">
                {errores.region}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="comuna">Comuna</label>
              <select
                id="comuna"
                name="comuna"
                value={form.comuna}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!form.region}
                className={claseInput('comuna')}
                aria-invalid={Boolean(errores.comuna)}
              >
                <option value="">
                  {form.region ? 'Seleccione su comuna' : '-- Primero elija una región --'}
                </option>
                {comunasDisponibles.map((comuna) => (
                  <option key={comuna} value={comuna}>
                    {comuna}
                  </option>
                ))}
              </select>
              <span className="form-hint">Comuna para cálculo de despacho.</span>
              <span id="error-comuna" className="error-message">
                {errores.comuna}
              </span>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Registrarse
          </button>

          <p className="form-footer-link">
            ¿Ya posees una cuenta? <Link to="/Login">Inicia sesión aquí</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Registro;
