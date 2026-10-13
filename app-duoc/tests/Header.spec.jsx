import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Header from '../src/Components/Header';

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  });

  it('renderiza marca', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText(/LEVEL-UP/i)).toBeInTheDocument();
  });

  it('muestra links de auth sin sesion', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Iniciar sesi/i)).toBeInTheDocument();
    expect(screen.getByText(/Registrarse/i)).toBeInTheDocument();
  });

  it('muestra carrito count', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Carrito \(0\)/i)).toBeInTheDocument();
  });
});