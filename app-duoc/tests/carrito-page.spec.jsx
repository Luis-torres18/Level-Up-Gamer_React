import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Carrito from '../src/Pages/carrito';
import { agregarAlCarrito, vaciarCarrito } from '../src/services/carrito';
import { getProductos, getProducto } from '../src/services/productos';

describe('pagina Carrito', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    getProductos();
    vaciarCarrito();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('muestra carrito vacio', () => {
    render(
      <MemoryRouter>
        <Carrito />
      </MemoryRouter>,
    );
    expect(screen.getByText(/vac.o/i)).toBeInTheDocument();
  });

  it('muestra producto agregado', () => {
    agregarAlCarrito(getProducto('JM001'));
    render(
      <MemoryRouter>
        <Carrito />
      </MemoryRouter>,
    );
    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.getByText(/Pagar Pedido/i)).toBeEnabled();
  });

  it('boton pagar vacia carrito', () => {
    agregarAlCarrito(getProducto('JM001'));
    render(
      <MemoryRouter>
        <Carrito />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Pagar Pedido/i }));
    expect(screen.getByText(/vac.o/i)).toBeInTheDocument();
  });

  it('boton quitar elimina item', () => {
    agregarAlCarrito(getProducto('JM001'));
    render(
      <MemoryRouter>
        <Carrito />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Quitar/i }));
    expect(screen.getByText(/vac.o/i)).toBeInTheDocument();
  });
});