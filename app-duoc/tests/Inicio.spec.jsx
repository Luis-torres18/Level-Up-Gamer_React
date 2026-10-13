import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Inicio from '../src/Pages/Inicio';
import { getProductos, vaciarCarrito } from '../src/services/productos';
import { registerUser, loginUser, logout } from '../src/services/auth';
import { vaciarCarrito as vaciar } from '../src/services/carrito';

describe('pagina Inicio', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    getProductos();
    vaciar();
    logout();
  });

  it('renderiza catalogo con productos', () => {
    render(
      <MemoryRouter>
        <Inicio />
      </MemoryRouter>,
    );
    expect(screen.getByText('Catan')).toBeInTheDocument();
  });

  it('muestra toast al agregar al carrito', () => {
    render(
      <MemoryRouter>
        <Inicio />
      </MemoryRouter>,
    );
    fireEvent.click(document.querySelector('.btn-add-cart'));
    expect(screen.getByRole('status')).toHaveTextContent(/carrito/i);
  });

  it('no muestra panel admin sin sesion', () => {
    render(
      <MemoryRouter>
        <Inicio />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/PANEL DE ADMINISTRACI/i)).toBeNull();
  });

  it('admin puede agregar producto', () => {
    registerUser({
      nombre: 'Admin Duoc',
      correo: 'admin@duocuc.cl',
      contrasena: 'Secret1!',
      telefono: '',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
    });
    loginUser('admin@duocuc.cl', 'Secret1!');
    render(
      <MemoryRouter>
        <Inicio />
      </MemoryRouter>,
    );
    expect(screen.getByText(/PANEL DE ADMINISTRACI/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Categor.a/i), { target: { value: 'Accesorios', name: 'categoria' } });
    // ensure name field set
    const nombre = screen.getByPlaceholderText(/Nintendo Switch 2/i);
    fireEvent.change(nombre, { target: { value: 'Teclado Test', name: 'nombre' } });
    const desc = screen.getByPlaceholderText(/Breve descripci/i);
    fireEvent.change(desc, { target: { value: 'desc', name: 'descripcion' } });
    const img = screen.getByPlaceholderText(/https:\/\/ejemplo/i);
    fireEvent.change(img, { target: { value: 'https://example.com/x.jpg', name: 'imagen' } });
    const precio = screen.getByPlaceholderText(/49990/i);
    fireEvent.change(precio, { target: { value: '1000', name: 'precio' } });
    fireEvent.click(screen.getByRole('button', { name: /Agregar producto/i }));
    expect(screen.getByText('Teclado Test')).toBeInTheDocument();
  });
});