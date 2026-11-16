import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';

import '/src/index.css';
import { REGIONES } from '../data/regiones';
import { ROLES, getSession } from '../services/auth';
import { actualizarUsuarioSesion } from '../services/sesion';
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
} from '../services/usuarios';
import {
  validarComuna,
  validarContrasena,
  validarCorreo,
  validarNombre,
  validarRegion,
  validarTelefono,
} from '../utils/validaciones';

const FORM_VACIO = {
  nombre: '',
  correo: '',
  contrasena: '',
  telefono: '',
  region: '',
  comuna: '',
  rol: ROLES.CLIENTE,
};

function formatearFecha(valor) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleDateString('es-CL');
}

// Pantalla de Administración: listar, crear, editar (incluido el rol) y eliminar usuarios.
function AdminUsuarios() {
  const sesion = getSession();
  const idActual = sesion?.id;

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');

  // modo: null (formulario oculto) | 'crear' | 'editar'
  const [modo, setModo] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [errores, setErrores] = useState({});
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState('');
  const toastTimer = useRef(null);

  const mostrarToast = (texto) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setMensaje(texto);
    toastTimer.current = setTimeout(() => setMensaje(''), 2500);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // GET /api/usuarios
  const cargarUsuarios = async () => {
    setCargando(true);
    setErrorCarga('');
    const resultado = await listarUsuarios();
    if (resultado.ok) setUsuarios(resultado.usuarios);
    else setErrorCarga(resultado.error);
    setCargando(false);
  };

  useEffect(() => {
    let activo = true;
    listarUsuarios().then((resultado) => {
      if (!activo) return;
      if (resultado.ok) setUsuarios(resultado.usuarios);
      else setErrorCarga(resultado.error);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      const coincideTexto =
        !texto ||
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.correo.toLowerCase().includes(texto);
      const coincideRol = filtroRol === 'TODOS' || usuario.rol === filtroRol;
      return coincideTexto && coincideRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  const totalAdmins = usuarios.filter((usuario) => usuario.rol === ROLES.ADMIN).length;

  // Regiones y comunas para los <select>. Si el usuario tiene una región que no está
  // en la lista (por ejemplo, creada desde Postman) se agrega para no perderla.
  const regiones = useMemo(() => {
    const nombres = REGIONES.map((item) => item.region);
    return form.region && !nombres.includes(form.region) ? [form.region, ...nombres] : nombres;
  }, [form.region]);

  const comunas = useMemo(() => {
    const lista = REGIONES.find((item) => item.region === form.region)?.comunas ?? [];
    return form.comuna && !lista.includes(form.comuna) ? [form.comuna, ...lista] : lista;
  }, [form.region, form.comuna]);

  const editandoseASiMismo = modo === 'editar' && editandoId === idActual;

  const abrirCrear = () => {
    setModo('crear');
    setEditandoId(null);
    setForm(FORM_VACIO);
    setErrores({});
    setErrorForm('');
  };

  const abrirEditar = (usuario) => {
    setModo('editar');
    setEditandoId(usuario.id);
    setForm({
      nombre: usuario.nombre ?? '',
      correo: usuario.correo ?? '',
      contrasena: '',
      telefono: usuario.telefono ?? '',
      region: usuario.region ?? '',
      comuna: usuario.comuna ?? '',
      rol: usuario.rol ?? ROLES.CLIENTE,
    });
    setErrores({});
    setErrorForm('');
    document.getElementById('form-usuario')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cerrarFormulario = () => {
    setModo(null);
    setEditandoId(null);
    setForm(FORM_VACIO);
    setErrores({});
    setErrorForm('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const siguiente = { ...prev, [name]: value };
      if (name === 'region') siguiente.comuna = '';
      return siguiente;
    });
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: '' }));
    if (errorForm) setErrorForm('');
  };

  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: validarNombre(form.nombre),
      correo: validarCorreo(form.correo),
      telefono: validarTelefono(form.telefono),
      region: validarRegion(form.region),
      comuna: validarComuna(form.comuna),
      // Al crear la contraseña es obligatoria; al editar solo se valida si se escribe una nueva.
      contrasena: modo === 'crear' || form.contrasena ? validarContrasena(form.contrasena) : '',
    };
    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((error) => !error);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (guardando || !validarFormulario()) return;

    setGuardando(true);
    const resultado =
      modo === 'crear'
        ? await crearUsuario(form) // POST /api/usuarios
        : await actualizarUsuario(editandoId, form); // PUT /api/usuarios/{id}
    setGuardando(false);

    if (!resultado.ok) {
      setErrorForm(resultado.error);
      return;
    }

    const guardado = resultado.usuario;
    if (modo === 'crear') {
      setUsuarios((prev) => [...prev, guardado]);
      mostrarToast(`Usuario "${guardado.nombre}" creado correctamente.`);
    } else {
      setUsuarios((prev) => prev.map((usuario) => (usuario.id === guardado.id ? guardado : usuario)));
      if (guardado.id === idActual) actualizarUsuarioSesion(guardado);
      mostrarToast(`Usuario "${guardado.nombre}" actualizado correctamente.`);
    }
    cerrarFormulario();
  };

  // DELETE /api/usuarios/{id}
  const handleEliminar = async (usuario) => {
    const confirmado = window.confirm(
      `¿Eliminar la cuenta de ${usuario.nombre} (${usuario.correo})? Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;

    const resultado = await eliminarUsuario(usuario.id);
    if (!resultado.ok) {
      mostrarToast(resultado.error);
      return;
    }

    setUsuarios((prev) => prev.filter((item) => item.id !== usuario.id));
    if (editandoId === usuario.id) cerrarFormulario();
    mostrarToast(`Cuenta de "${usuario.nombre}" eliminada.`);
  };

  const claseInput = (campo) => (errores[campo] ? 'input-error' : '');

  return (
    <main className="admin-usuarios-main">
      <section className="admin-panel">
        <div className="section-header">
          <h2>GESTIÓN DE USUARIOS</h2>
          <p>Revisa las cuentas registradas, edita sus datos o cambia su rol</p>
        </div>

        {mensaje && (
          <div className="toast" role="status" aria-live="polite">
            {mensaje}
          </div>
        )}

        <div className="admin-stats">
          <div className="admin-stat">
            <span className="admin-stat-valor">{usuarios.length}</span>
            <span className="admin-stat-label">Usuarios</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-valor">{totalAdmins}</span>
            <span className="admin-stat-label">Administradores</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-valor">{usuarios.length - totalAdmins}</span>
            <span className="admin-stat-label">Clientes</span>
          </div>
        </div>

        <div className="admin-toolbar">
          <input
            type="search"
            className="admin-search"
            placeholder="Buscar por nombre o correo"
            aria-label="Buscar usuarios"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
          <select
            className="admin-filter"
            aria-label="Filtrar por rol"
            value={filtroRol}
            onChange={(event) => setFiltroRol(event.target.value)}
          >
            <option value="TODOS">Todos los roles</option>
            <option value={ROLES.ADMIN}>ADMIN</option>
            <option value={ROLES.CLIENTE}>CLIENTE</option>
          </select>
          <button type="button" className="btn-primary" onClick={abrirCrear}>
            + Nuevo usuario
          </button>
          <Link to="/Inicio#admin-productos" className="btn-secondary">
            Gestionar productos
          </Link>
        </div>

        {modo && (
          <form id="form-usuario" className="admin-form admin-user-form" onSubmit={handleSubmit} noValidate>
            <h3 className="admin-form-title">
              {modo === 'crear' ? 'Nuevo usuario' : `Editar usuario: ${form.nombre || ''}`}
            </h3>

            {errorForm && <p className="form-alert form-alert-error">{errorForm}</p>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="usuario-nombre">Nombre completo</label>
                <input
                  id="usuario-nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className={claseInput('nombre')}
                />
                <span className="error-message">{errores.nombre}</span>
              </div>
              <div className="form-group">
                <label htmlFor="usuario-correo">Correo electrónico</label>
                <input
                  id="usuario-correo"
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  className={claseInput('correo')}
                />
                <span className="error-message">{errores.correo}</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="usuario-contrasena">
                  {modo === 'crear' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
                </label>
                <input
                  id="usuario-contrasena"
                  name="contrasena"
                  type="password"
                  autoComplete="new-password"
                  placeholder={modo === 'crear' ? '' : 'Déjala vacía para mantener la actual'}
                  value={form.contrasena}
                  onChange={handleChange}
                  className={claseInput('contrasena')}
                />
                <span className="error-message">{errores.contrasena}</span>
              </div>
              <div className="form-group">
                <label htmlFor="usuario-telefono">Teléfono (opcional)</label>
                <input
                  id="usuario-telefono"
                  name="telefono"
                  placeholder="+56 9 1234 5678"
                  value={form.telefono}
                  onChange={handleChange}
                  className={claseInput('telefono')}
                />
                <span className="error-message">{errores.telefono}</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="usuario-region">Región</label>
                <select
                  id="usuario-region"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className={claseInput('region')}
                >
                  <option value="">Seleccione una región</option>
                  {regiones.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <span className="error-message">{errores.region}</span>
              </div>
              <div className="form-group">
                <label htmlFor="usuario-comuna">Comuna</label>
                <select
                  id="usuario-comuna"
                  name="comuna"
                  value={form.comuna}
                  onChange={handleChange}
                  disabled={!form.region}
                  className={claseInput('comuna')}
                >
                  <option value="">Seleccione una comuna</option>
                  {comunas.map((comuna) => (
                    <option key={comuna} value={comuna}>
                      {comuna}
                    </option>
                  ))}
                </select>
                <span className="error-message">{errores.comuna}</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="usuario-rol">Rol</label>
              <select
                id="usuario-rol"
                name="rol"
                value={form.rol}
                onChange={handleChange}
                disabled={editandoseASiMismo}
              >
                <option value={ROLES.CLIENTE}>CLIENTE (usuario normal)</option>
                <option value={ROLES.ADMIN}>ADMIN (administrador)</option>
              </select>
              {editandoseASiMismo && (
                <span className="form-hint">No puedes quitarte tu propio rol de administrador.</span>
              )}
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn-submit" disabled={guardando}>
                {guardando ? 'Guardando...' : modo === 'crear' ? 'Crear usuario' : 'Guardar cambios'}
              </button>
              <button type="button" className="btn-cancel" onClick={cerrarFormulario}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {cargando && (
          <p className="estado-carga" role="status">
            Cargando usuarios...
          </p>
        )}

        {errorCarga && (
          <div className="estado-carga estado-error" role="alert">
            <p>{errorCarga}</p>
            <button type="button" className="btn-cancel" onClick={cargarUsuarios}>
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !errorCarga && (
          <div className="tabla-wrapper">
            <table className="tabla-usuarios">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Región / Comuna</th>
                  <th>Rol</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="tabla-vacia">
                      No hay usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((usuario) => {
                    const esYo = usuario.id === idActual;
                    return (
                      <tr key={usuario.id}>
                        <td data-label="Nombre">
                          <span>
                            {usuario.nombre}
                            {esYo && <span className="tag-tu"> (tú)</span>}
                          </span>
                        </td>
                        <td data-label="Correo">{usuario.correo}</td>
                        <td data-label="Teléfono">{usuario.telefono || '—'}</td>
                        <td data-label="Región / Comuna">
                          <span>
                            {usuario.region}
                            <br />
                            <small>{usuario.comuna}</small>
                          </span>
                        </td>
                        <td data-label="Rol">
                          <span className={`rol-badge rol-${String(usuario.rol).toLowerCase()}`}>
                            {usuario.rol}
                          </span>
                        </td>
                        <td data-label="Registro">{formatearFecha(usuario.creadoEl)}</td>
                        <td data-label="Acciones">
                          <div className="tabla-acciones">
                            <button
                              type="button"
                              className="btn-edit"
                              onClick={() => abrirEditar(usuario)}
                              aria-label={`Editar a ${usuario.nombre}`}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn-delete"
                              onClick={() => handleEliminar(usuario)}
                              disabled={esYo}
                              title={esYo ? 'No puedes eliminar tu propia cuenta' : undefined}
                              aria-label={`Eliminar a ${usuario.nombre}`}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminUsuarios;
