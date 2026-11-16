import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Header from '../src/Components/Header';
import { getSession } from '../src/services/auth';
import { guardarSesion } from '../src/services/sesion';

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

const abrirMenu = () => fireEvent.click(screen.getByRole('button', { name: /Menú de usuario/i }));

const iniciarSesionDePrueba = (rol = 'CLIENTE') => {
  guardarSesion({
    token: 'token-prueba',
    expiraEn: Date.now() + 60_000,
    usuario: { id: 5, nombre: 'Juan Pérez', correo: 'juan@correo.cl', rol, descuentoDuoc: false },
  });
};

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  });

  it('renderiza marca', () => {
    renderHeader();
    expect(screen.getByText(/LEVEL-UP/i)).toBeInTheDocument();
  });

  it('muestra el ícono de usuario con el menú cerrado por defecto', () => {
    renderHeader();
    const boton = screen.getByRole('button', { name: /Menú de usuario/i });
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Iniciar sesi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Registrarse/i)).not.toBeInTheDocument();
  });

  it('muestra links de auth sin sesion al abrir el menú', () => {
    renderHeader();
    abrirMenu();
    expect(screen.getByRole('button', { name: /Menú de usuario/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText(/Iniciar sesi/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrarse/i)).toBeInTheDocument();
    expect(screen.queryByText(/Cerrar sesi/i)).not.toBeInTheDocument();
  });

  it('el menú se cierra al volver a clickear el ícono', () => {
    renderHeader();
    abrirMenu();
    abrirMenu();
    expect(screen.queryByText(/Iniciar sesi/i)).not.toBeInTheDocument();
  });

  it('el menú se cierra con la tecla Escape', () => {
    renderHeader();
    abrirMenu();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText(/Iniciar sesi/i)).not.toBeInTheDocument();
  });

  it('el menú se cierra al hacer clic fuera', () => {
    renderHeader();
    abrirMenu();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText(/Iniciar sesi/i)).not.toBeInTheDocument();
  });

  it('con sesión iniciada solo muestra la opción de cerrar sesión', () => {
    iniciarSesionDePrueba();
    renderHeader();
    abrirMenu();
    expect(screen.getByText(/Hola, Juan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cerrar sesi/i })).toBeInTheDocument();
    expect(screen.queryByText(/Iniciar sesi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Registrarse/i)).not.toBeInTheDocument();
  });

  it('cerrar sesión elimina la sesión y vuelve a mostrar las opciones de auth', () => {
    iniciarSesionDePrueba();
    renderHeader();
    abrirMenu();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Cerrar sesi/i }));
    });
    expect(getSession()).toBeNull();
    expect(screen.queryByText(/Cerrar sesi/i)).not.toBeInTheDocument();

    abrirMenu();
    expect(screen.getByText(/Iniciar sesi/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrarse/i)).toBeInTheDocument();
  });

  it('muestra carrito count', () => {
    renderHeader();
    expect(screen.getByText(/Carrito \(0\)/i)).toBeInTheDocument();
  });

  it('un CLIENTE no ve el botón Administración', () => {
    iniciarSesionDePrueba('CLIENTE');
    renderHeader();
    expect(screen.queryByRole('link', { name: 'Administración' })).toBeNull();
    abrirMenu();
    expect(screen.getByText('CLIENTE')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Gestionar usuarios' })).toBeNull();
  });

  it('un ADMIN ve Administración, que lleva a la gestión de usuarios', () => {
    iniciarSesionDePrueba('ADMIN');
    renderHeader();
    expect(screen.getByRole('link', { name: 'Administración' })).toHaveAttribute('href', '/Admin/Usuarios');
    abrirMenu();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gestionar usuarios' })).toHaveAttribute('href', '/Admin/Usuarios');
  });
});
