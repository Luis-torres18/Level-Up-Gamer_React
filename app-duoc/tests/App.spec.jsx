import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../src/App';
import { crearFakeApi } from './helpers/fakeApi';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    crearFakeApi();
  });

  it('renderiza header y footer', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    await act(async () => {});
    expect(screen.getAllByText(/LEVEL-UP/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Duoc UC/i)).toBeInTheDocument();
  });

  it('una ruta desconocida redirige al inicio', async () => {
    render(
      <MemoryRouter initialEntries={['/no-existe']}>
        <App />
      </MemoryRouter>,
    );
    await act(async () => {});
    expect(screen.getByText(/ELEVA TU NIVEL/i)).toBeInTheDocument();
  });

  it('la ruta de administración pide iniciar sesión', async () => {
    render(
      <MemoryRouter initialEntries={['/Admin/Usuarios']}>
        <App />
      </MemoryRouter>,
    );
    await act(async () => {});
    expect(screen.getByText(/INICIO DE SESIÓN/i)).toBeInTheDocument();
    expect(screen.getByText('Debes iniciar sesión para acceder a esa página.')).toBeInTheDocument();
  });
});
