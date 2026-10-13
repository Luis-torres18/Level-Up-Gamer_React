import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Registro from '../src/Pages/registro';
import { REGIONES } from '../src/data/regiones';

describe('pagina Registro', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  });

  it('renderiza titulo', () => {
    render(
      <MemoryRouter>
        <Registro />
      </MemoryRouter>,
    );
    expect(screen.getByText(/REGISTRO DE USUARIO/i)).toBeInTheDocument();
  });

  it('comunas se habilitan tras seleccionar region', () => {
    render(
      <MemoryRouter>
        <Registro />
      </MemoryRouter>,
    );
    const region = screen.getByRole('combobox', { name: /Regi.n/i });
    fireEvent.change(region, { target: { name: 'region', value: REGIONES[0].region } });
    const comuna = screen.getByRole('combobox', { name: /Comuna/i });
    expect(comuna).not.toBeDisabled();
  });

  it('validacion nombre muestra error', () => {
    render(
      <MemoryRouter>
        <Registro />
      </MemoryRouter>,
    );
    const nombre = screen.getByRole('textbox', { name: /Nombre Completo/i });
    fireEvent.change(nombre, { target: { name: 'nombre', value: 'ab', value: 'ab' } });
    // trigger blur
    fireEvent.blur(nombre);
    expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
  });

  it('registro exitoso no muestra error', () => {
    render(
      <MemoryRouter>
        <Registro />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByRole('textbox', { name: /Nombre Completo/i }), { target: { name: 'nombre', value: 'Ignacio Morales' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^Correo Electr/i }), { target: { name: 'correo', value: 'nuevo@duoc.cl' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Confirmar Correo/i }), { target: { name: 'confirmarCorreo', value: 'nuevo@duoc.cl' } });
    // use password inputs by id
    const contrasena = document.getElementById('contrasena');
    const confirmar = document.getElementById('confirmar-contrasena');
    fireEvent.change(contrasena, { target: { name: 'contrasena', value: 'Secret1!' } });
    fireEvent.change(confirmar, { target: { name: 'confirmarContrasena', value: 'Secret1!' } });
    const telefono = document.getElementById('telefono');
    fireEvent.change(telefono, { target: { name: 'telefono', value: '+56 9 1234 5678' } });
    const region = screen.getByRole('combobox', { name: /Regi.n/i });
    fireEvent.change(region, { target: { name: 'region', value: REGIONES[0].region } });
    const comuna = screen.getByRole('combobox', { name: /Comuna/i });
    fireEvent.change(comuna, { target: { name: 'comuna', value: REGIONES[0].comunas[0] } });
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    expect(screen.queryByText(/Ya existe una cuenta/i)).toBeNull();
  });
});