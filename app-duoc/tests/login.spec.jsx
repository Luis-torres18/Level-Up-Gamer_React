import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Login from '../src/Pages/login';
import { registerUser } from '../src/services/auth';

describe('pagina Login', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  });

  it('renderiza titulo', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByText(/INICIO DE SESI/i)).toBeInTheDocument();
  });

  it('muestra alerta de registro exitoso via state', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/Login', state: { registrado: true, correo: 'a@duoc.cl' } }]}>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Cuenta creada con/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('a@duoc.cl')).toBeInTheDocument();
  });

  it('valida campos obligatorios', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
    // Should show required messages
    expect(screen.getByText(/correo electr.nico es obligatorio/i)).toBeInTheDocument();
  });

  it('login fallido muestra alerta error', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/Correo Electr/i), { target: { name: 'correo', value: 'no@x.cl' } });
    fireEvent.change(screen.getByLabelText(/Contrase/i), { target: { name: 'contrasena', value: 'Secret1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
    expect(screen.getByText(/No existe una cuenta/i)).toBeInTheDocument();
  });

  it('login exitoso navega', async () => {
    registerUser({
      nombre: 'Juan Perez',
      correo: 'juan@duoc.cl',
      contrasena: 'Secret1!',
      telefono: '',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
    });
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/Correo Electr/i), { target: { name: 'correo', value: 'juan@duoc.cl' } });
    fireEvent.change(screen.getByLabelText(/Contrase/i), { target: { name: 'contrasena', value: 'Secret1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
    // no alert error
    expect(screen.queryByText(/contrase.a es incorrecta/i)).toBeNull();
  });
});