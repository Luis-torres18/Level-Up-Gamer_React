import { useEffect, useState, useSyncExternalStore } from 'react';
import '/src/index.css';

import { getSession } from '../services/auth';
import { cargarProductos, formatearPrecio } from '../services/productos';
import {
  cambiarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  getCarritoItems,
  obtenerTotales,
  subscribeCarrito,
} from '../services/carrito';

function Carrito() {
  const items = useSyncExternalStore(subscribeCarrito, getCarritoItems);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  // Trae el catálogo desde la API para conocer nombre, precio e imagen de cada ítem.
  useEffect(() => {
    let activo = true;
    cargarProductos().then((resultado) => {
      if (!activo) return;
      if (!resultado.ok) setErrorCarga(resultado.error);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  const sesion = getSession();
  const aplicaDescuento = Boolean(sesion?.descuentoDuoc);

  const totales = obtenerTotales(aplicaDescuento);

  const handlePagar = () => {
    if (!window.confirm('¿Confirmar y pagar tu pedido?')) return;
    vaciarCarrito();
    window.alert('¡Gracias por tu compra! Tu pedido fue registrado.');
  };

  return (
    <main className="cart-main">
      <h1>MI CARRITO DE COMPRAS</h1>

      <div className="cart-layout">
        <section className="cart-items-container" id="cart-items-wrapper">
          {errorCarga && (
            <p className="form-alert form-alert-error" role="alert">
              {errorCarga}
            </p>
          )}

          {cargando && items.length === 0 ? (
            <p className="empty-cart-message" role="status">
              Cargando tu carrito...
            </p>
          ) : items.length === 0 ? (
            <p className="empty-cart-message">
              Tu carrito está vacío. Agrega productos desde el{' '}
              <a href="/Inicio#catalogo">catálogo</a>.
            </p>
          ) : (
            items.map(({ producto, cantidad }) => (
              <article className="cart-item" key={producto.id}>
                <img src={producto.imagen} alt={producto.nombre} />

                <div className="item-info">
                  <h3>{producto.nombre}</h3>
                  <p>
                    {producto.categoria} · {formatearPrecio(producto.precio)} c/u
                  </p>
                  <button
                    type="button"
                    className="btn-remove-item"
                    onClick={() => eliminarDelCarrito(producto.id)}
                  >
                    Quitar
                  </button>
                </div>

                <div className="item-controls">
                  <button
                    type="button"
                    className="btn-qty"
                    aria-label="Disminuir cantidad"
                    onClick={() => cambiarCantidad(producto.id, cantidad - 1)}
                  >
                    −
                  </button>
                  <span className="item-qty-display">{cantidad}</span>
                  <button
                    type="button"
                    className="btn-qty"
                    aria-label="Aumentar cantidad"
                    onClick={() => cambiarCantidad(producto.id, cantidad + 1)}
                  >
                    +
                  </button>
                </div>

                <span className="item-total">
                  {formatearPrecio(producto.precio * cantidad)}
                </span>
              </article>
            ))
          )}
        </section>

        <aside className="cart-summary">
          <h2>RESUMEN DEL PEDIDO</h2>

          <div className="summary-row">
            <span>Subtotal ({items.length} productos)</span>
            <span>{formatearPrecio(totales.subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Descuento {aplicaDescuento && 'Duoc (20%)'}</span>
            <span>-{formatearPrecio(totales.descuento)}</span>
          </div>

          <div className="summary-total">
            <span>TOTAL:</span>
            <span>{formatearPrecio(totales.total)}</span>
          </div>

          <button
            type="button"
            id="btn-pagar"
            className="btn-checkout"
            disabled={items.length === 0}
            onClick={handlePagar}
          >
            Pagar Pedido
          </button>
        </aside>
      </div>
    </main>
  );
}

export default Carrito;
