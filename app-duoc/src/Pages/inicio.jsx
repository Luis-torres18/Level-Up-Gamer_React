import { useEffect, useRef, useState } from 'react';
import '/src/index.css';

import { getSession, esCorreoAdmin } from '../services/auth';
import {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  getProductos,
  subscribeProductos,
  formatearPrecio,
} from '../services/productos';
import { agregarAlCarrito } from '../services/carrito';

const CATEGORIAS_SUGERIDAS = [
  'Juegos de Mesa',
  'Accesorios',
  'Consolas',
  'Computadores',
  'Sillas Gamers',
  'Mouse',
  'Teclados',
  'Audífonos',
];

const ESTADO_INICIAL_FORM = {
  categoria: '',
  nombre: '',
  descripcion: '',
  imagen: '',
  precio: '',
};

function Inicio() {
  const sesion = getSession();
  const esAdmin = esCorreoAdmin(sesion?.correo);

  const [productos, setProductos] = useState(getProductos);
  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => subscribeProductos(() => setProductos(getProductos())), []);

  // Muestra una notificación emergente que se oculta sola a los 2 segundos.
  const mostrarToast = (texto) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setMensaje(texto);
    toastTimer.current = setTimeout(() => setMensaje(''), 2000);
  };

  // Limpia el temporizador si el componente se desmonta.
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const resetFormulario = () => {
    setForm(ESTADO_INICIAL_FORM);
    setEditandoId(null);
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const resultado = editandoId
      ? actualizarProducto(editandoId, form)
      : crearProducto(form);

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }

    mostrarToast(
      editandoId
        ? `Producto "${resultado.producto.nombre}" actualizado correctamente.`
        : `Producto "${resultado.producto.nombre}" agregado al catálogo.`,
    );
    resetFormulario();
  };

  const handleEditar = (producto) => {
    setEditandoId(producto.id);
    setError('');
    setForm({
      categoria: producto.categoria,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      precio: String(producto.precio),
    });
    document.getElementById('admin-productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEliminar = (producto) => {
    if (!window.confirm(`¿Eliminar "${producto.nombre}" del catálogo?`)) return;
    const resultado = eliminarProducto(producto.id);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    if (editandoId === producto.id) resetFormulario();
    mostrarToast(`Producto "${producto.nombre}" eliminado.`);
  };

  const handleAgregarAlCarrito = (producto) => {
    agregarAlCarrito(producto);
    mostrarToast(`"${producto.nombre}" se agregó al carrito.`);
  };

  return (
    <main>
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1>
              ELEVA TU NIVEL <span>GAMER</span> AL MÁXIMO
            </h1>
            <p>
              Equipamiento de alto rendimiento, consolas de última generación y juegos de
              mesa clásicos con envíos rápidos y seguros a todo Chile.
            </p>
            <a href="#catalogo" className="btn-cta">
              Ver Productos
            </a>
          </div>
        </div>
      </section>

      {mensaje && (
        <div className="toast" role="status" aria-live="polite">
          {mensaje}
        </div>
      )}

      <section id="catalogo" className="catalog-section">
        <div className="section-header">
          <h2>CATÁLOGO DESTACADO</h2>
          <p>Equípate con los favoritos de nuestra comunidad</p>
        </div>

        <div className="products-grid">
          {productos.map((producto) => (
            <article className="product-card" key={producto.id}>
              <figure>
                <img src={producto.imagen} alt={producto.nombre} />
              </figure>
              <span className="product-tag">{producto.categoria}</span>
              <h3 className="product-title">{producto.nombre}</h3>
              <p className="product-desc">{producto.descripcion}</p>
              <div className="product-footer">
                <span className="product-price">{formatearPrecio(producto.precio)}</span>
                <button
                  type="button"
                  className="btn-add-cart"
                  onClick={() => handleAgregarAlCarrito(producto)}
                >
                  Añadir
                </button>
              </div>

              {esAdmin && (
                <div className="product-admin-actions">
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => handleEditar(producto)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => handleEliminar(producto)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {esAdmin && (
        <section id="admin-productos" className="admin-panel">
          <div className="section-header">
            <h2>PANEL DE ADMINISTRACIÓN</h2>
            <p>Agrega, actualiza o elimina productos del catálogo</p>
          </div>

          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            {error && <p className="form-alert form-alert-error">{error}</p>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="admin-categoria">Categoría</label>
                <input
                  type="text"
                  id="admin-categoria"
                  name="categoria"
                  list="lista-categorias"
                  placeholder="Ej: Consolas"
                  value={form.categoria}
                  onChange={handleChange}
                />
                <datalist id="lista-categorias">
                  {CATEGORIAS_SUGERIDAS.map((categoria) => (
                    <option key={categoria} value={categoria} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label htmlFor="admin-nombre">Nombre</label>
                <input
                  type="text"
                  id="admin-nombre"
                  name="nombre"
                  placeholder="Ej: Nintendo Switch 2"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="admin-descripcion">Descripción</label>
              <textarea
                id="admin-descripcion"
                name="descripcion"
                placeholder="Breve descripción del producto"
                value={form.descripcion}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="admin-imagen">Imagen (link)</label>
                <input
                  type="url"
                  id="admin-imagen"
                  name="imagen"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={form.imagen}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-precio">Valor ($)</label>
                <input
                  type="number"
                  id="admin-precio"
                  name="precio"
                  min="1"
                  placeholder="Ej: 49990"
                  value={form.precio}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn-submit">
                {editandoId ? 'Guardar cambios' : 'Agregar producto'}
              </button>
              {editandoId && (
                <button type="button" className="btn-cancel" onClick={resetFormulario}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      )}
    </main>
  );
}

export default Inicio;
