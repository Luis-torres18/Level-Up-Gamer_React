import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

import RutaProtegida from '../src/Components/RutaProtegida';
import { logout } from '../src/services/auth';
import { guardarSesion } from '../src/services/sesion';

function LoginStub() {
  const location = useLocation();
  return <p>Login desde {location.state?.desde}</p>;
}

function renderRuta(rol) {
  return render(
    <MemoryRouter initialEntries={['/privada']}>
      <Routes>
        <Route
          path="/privada"
          element={
            <RutaProtegida rol={rol}>
              <p>Contenido privado</p>
            </RutaProtegida>
          }
        />
        <Route path="/Login" element={<LoginStub />} />
      </Routes>
    </MemoryRouter>,
  );
}

const sesionCon = (rol) =>
  guardarSesion({
    token: 't',
    expiraEn: Date.now() + 60_000,
    usuario: { id: 1, nombre: 'Prueba', correo: 'p@p.cl', rol },
  });

describe('RutaProtegida', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sin sesión redirige al Login recordando la ruta', () => {
    renderRuta('ADMIN');
    expect(screen.getByText('Login desde /privada')).toBeInTheDocument();
  });

  it('con un rol distinto muestra acceso denegado', () => {
    sesionCon('CLIENTE');
    renderRuta('ADMIN');
    expect(screen.getByText('ACCESO DENEGADO')).toBeInTheDocument();
    expect(screen.queryByText('Contenido privado')).toBeNull();
  });

  it('con el rol correcto muestra el contenido', () => {
    sesionCon('ADMIN');
    renderRuta('ADMIN');
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('sin rol requerido basta con estar logueado', () => {
    sesionCon('CLIENTE');
    renderRuta();
    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('si la sesión se cierra, saca al usuario de la página', () => {
    sesionCon('ADMIN');
    renderRuta('ADMIN');
    act(() => logout());
    expect(screen.getByText('Login desde /privada')).toBeInTheDocument();
  });
});
