import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Carrito from '../src/Pages/carrito';
import { agregarAlCarrito, vaciarCarrito } from '../src/services/carrito';
import { cargarProductos, getProductosCache, formatearPrecio } from '../src/services/productos';
import { logout } from '../src/services/auth';
import { guardarSesion } from '../src/services/sesion';
import { crearFakeApi } from './helpers/fakeApi';

const CATAN = 1;
const PS5 = 2;

const getProducto = (id) => getProductosCache().find((producto) => producto.id === id);

// Renderiza y espera a que termine la carga del catálogo (GET /api/productos).
async function renderCarrito() {
  const vista = render(
    <MemoryRouter>
      <Carrito />
    </MemoryRouter>,
  );
  await act(async () => {});
  return vista;
}

function agregarProducto(id, veces = 1) {
  const producto = getProducto(id);
  for (let i = 0; i < veces; i += 1) agregarAlCarrito(producto);
}

function loginConDescuentoDuoc() {
  guardarSesion({
    token: 'token-duoc',
    expiraEn: Date.now() + 60_000,
    usuario: { id: 9, nombre: 'Estudiante Duoc', correo: 'estudiante@duoc.cl', rol: 'CLIENTE', descuentoDuoc: true },
  });
}

describe('pagina Carrito', () => {
  let api;

  beforeEach(async () => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    api = crearFakeApi();
    await cargarProductos();
    vaciarCarrito();
    logout();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('carrito vacío', () => {
    it('muestra el mensaje de carrito vacío con enlace al catálogo', async () => {
      await renderCarrito();
      expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /catálogo/i })).toHaveAttribute(
        'href',
        '/Inicio#catalogo',
      );
    });

    it('el botón de pagar está deshabilitado sin productos', async () => {
      await renderCarrito();
      expect(screen.getByRole('button', { name: /Pagar Pedido/i })).toBeDisabled();
    });

    it('muestra subtotal y total en $0', async () => {
      await renderCarrito();
      const resumen = document.querySelector('.cart-summary');
      expect(screen.getByText(/Subtotal \(0 productos\)/i)).toBeInTheDocument();
      expect(within(resumen).getAllByText(formatearPrecio(0)).length).toBeGreaterThan(0);
    });
  });

  describe('productos en el carrito', () => {
    it('muestra nombre, categoría, precio unitario y total del producto', async () => {
      agregarProducto(CATAN);
      await renderCarrito();
      const producto = getProducto(CATAN);
      const tarjeta = screen.getByText(producto.nombre).closest('article');
      expect(screen.getByText(producto.nombre)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`${producto.categoria} ·`))).toBeInTheDocument();
      expect(within(tarjeta.querySelector('.item-info')).getByText(
        new RegExp(formatearPrecio(producto.precio).replace('$', '\\$')),
      )).toBeInTheDocument();
      expect(within(tarjeta.querySelector('.item-total')).getByText(
        new RegExp(formatearPrecio(producto.precio).replace('$', '\\$')),
      )).toBeInTheDocument();
    });

    it('al agregar dos veces un producto la cantidad es 2 y el total se duplica', async () => {
      agregarProducto(CATAN, 2);
      await renderCarrito();
      const producto = getProducto(CATAN);
      const tarjeta = screen.getByText(producto.nombre).closest('article');
      expect(within(tarjeta.querySelector('.item-qty-display')).getByText('2')).toBeInTheDocument();
      expect(tarjeta.querySelector('.item-total')).toHaveTextContent(
        formatearPrecio(producto.precio * 2),
      );
    });

    it('el resumen muestra subtotal, descuento $0 y total para usuario sin descuento', async () => {
      agregarProducto(CATAN);
      await renderCarrito();
      const producto = getProducto(CATAN);
      const filas = document.querySelectorAll('.summary-row');
      expect(filas[0]).toHaveTextContent(/Subtotal \(1 productos\)/i);
      expect(filas[0]).toHaveTextContent(formatearPrecio(producto.precio));
      expect(filas[1]).toHaveTextContent(`-${formatearPrecio(0)}`);
      expect(document.querySelector('.summary-total')).toHaveTextContent('TOTAL:');
      expect(document.querySelector('.summary-total')).toHaveTextContent(
        formatearPrecio(producto.precio),
      );
    });

    it('múltiples productos distintos suman correctamente el subtotal', async () => {
      agregarProducto(CATAN);
      agregarProducto(PS5);
      await renderCarrito();
      const esperado =
        getProducto(CATAN).precio + getProducto(PS5).precio;
      const filaSubtotal = document.querySelectorAll('.summary-row')[0];
      expect(filaSubtotal).toHaveTextContent(/Subtotal \(2 productos\)/i);
      expect(filaSubtotal).toHaveTextContent(formatearPrecio(esperado));
    });
  });

  describe('descuento Duoc UC', () => {
    it('con sesión Duoc aplica 20% de descuento y lo muestra en el resumen', async () => {
      loginConDescuentoDuoc();
      agregarProducto(CATAN);
      await renderCarrito();
      const producto = getProducto(CATAN);
      const descuento = Math.round(producto.precio * 0.2);
      expect(screen.getByText(/Duoc \(20%\)/i)).toBeInTheDocument();
      expect(screen.getByText(`-${formatearPrecio(descuento)}`)).toBeInTheDocument();
      expect(screen.getByText(formatearPrecio(producto.precio - descuento))).toBeInTheDocument();
    });

    it('sin sesión Duoc no aplica descuento', async () => {
      agregarProducto(CATAN);
      await renderCarrito();
      expect(screen.queryByText(/Duoc \(20%\)/i)).toBeNull();
    });
  });

  describe('controles de cantidad', () => {
    it('el botón + aumenta la cantidad', async () => {
      agregarProducto(CATAN);
      await renderCarrito();
      fireEvent.click(screen.getByRole('button', { name: /Aumentar cantidad/i }));
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('el botón − decrementa la cantidad', async () => {
      agregarProducto(CATAN, 2);
      await renderCarrito();
      fireEvent.click(screen.getByRole('button', { name: /Disminuir cantidad/i }));
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('la cantidad no baja de 1', async () => {
      agregarProducto(CATAN);
      await renderCarrito();
      fireEvent.click(screen.getByRole('button', { name: /Disminuir cantidad/i }));
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText(getProducto(CATAN).nombre)).toBeInTheDocument();
    });

    it('el total del ítem se recalcula al cambiar la cantidad', async () => {
      agregarProducto(CATAN);
      await renderCarrito();
      fireEvent.click(screen.getByRole('button', { name: /Aumentar cantidad/i }));
      const total = document.querySelector('.item-total');
      expect(total).toHaveTextContent(formatearPrecio(getProducto(CATAN).precio * 2));
    });
  });

  describe('acciones sobre el carrito', () => {
    it('el botón Quitar elimina solo ese producto', async () => {
      agregarProducto(CATAN);
      agregarProducto(PS5);
      await renderCarrito();
      const tarjeta = screen.getByText(getProducto(CATAN).nombre).closest('article');
      fireEvent.click(within(tarjeta).getByRole('button', { name: /Quitar/i }));
      expect(screen.queryByText(getProducto(CATAN).nombre)).toBeNull();
      expect(screen.getByText(getProducto(PS5).nombre)).toBeInTheDocument();
    });

    it('pagar con confirmación vacía el carrito y agradece la compra', async () => {
      agregarProducto(CATAN);
      await renderCarrito();
      fireEvent.click(screen.getByRole('button', { name: /Pagar Pedido/i }));
      expect(window.confirm).toHaveBeenCalledWith('¿Confirmar y pagar tu pedido?');
      expect(window.alert).toHaveBeenCalledWith(
        '¡Gracias por tu compra! Tu pedido fue registrado.',
      );
      expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Pagar Pedido/i })).toBeDisabled();
    });

    it('pagar con cancelación conserva el carrito', async () => {
      window.confirm.mockReturnValue(false);
      agregarProducto(CATAN);
      await renderCarrito();
      fireEvent.click(screen.getByRole('button', { name: /Pagar Pedido/i }));
      expect(screen.getByText(getProducto(CATAN).nombre)).toBeInTheDocument();
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('conexión con la API', () => {
    it('muestra un error si no se puede cargar el catálogo', async () => {
      api.sinConexion = true;
      await renderCarrito();
      expect(screen.getByRole('alert')).toHaveTextContent(/No se pudo conectar con el servidor/);
    });
  });
});
