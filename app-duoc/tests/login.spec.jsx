import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import Login from '../src/Pages/login';
import { registerUser } from '../src/services/auth';

// Stub que permite verificar si la navegación hacia /Inicio ocurrió.
function InicioStub() {
  return <p>Pantalla de Inicio</p>;
}

function renderLogin(initialEntries = ['/Login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Inicio" element={<InicioStub />} />
      </Routes>
    </MemoryRouter>,
  );
}

function registrarUsuario() {
  registerUser({
    nombre: 'Juan Perez',
    correo: 'juan@duoc.cl',
    contrasena: 'Secret1!',
    telefono: '',
    region: 'Metropolitana de Santiago',
    comuna: 'Santiago',
  });
}

function completarFormulario(correo, contrasena) {
  fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
    target: { name: 'correo', value: correo },
  });
  fireEvent.change(screen.getByLabelText('Contraseña'), {
    target: { name: 'contrasena', value: contrasena },
  });
}

describe('pagina Login', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  });

  describe('renderizado', () => {
    it('renderiza título, formulario y enlace a registro', () => {
      renderLogin();
      expect(screen.getByText(/INICIO DE SESIÓN/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ingresar a mi cuenta/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Crea una cuenta aquí/i })).toHaveAttribute(
        'href',
        '/Registro',
      );
    });

    it('muestra alerta de éxito y prellena el correo al venir de un registro', () => {
      renderLogin([
        { pathname: '/Login', state: { registrado: true, correo: 'nuevo@duoc.cl' } },
      ]);
      expect(screen.getByText(/Cuenta creada con éxito/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('nuevo@duoc.cl')).toBeInTheDocument();
    });

    it('no muestra alertas cuando se entra sin estado previo', () => {
      renderLogin();
      expect(screen.queryByText(/Cuenta creada con éxito/i)).toBeNull();
    });
  });

  describe('validación en campos', () => {
    it('al perder el foco con el correo vacío muestra el error de obligatoriedad', () => {
      renderLogin();
      fireEvent.blur(screen.getByLabelText('Correo Electrónico'));
      expect(screen.getByText(/El correo electrónico es obligatorio/i)).toBeInTheDocument();
    });

    it('al perder el foco con un correo inválido muestra el error de formato', () => {
      renderLogin();
      fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
        target: { name: 'correo', value: 'no-es-correo' },
      });
      fireEvent.blur(screen.getByLabelText('Correo Electrónico'));
      expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
    });

    it('al perder el foco con la contraseña vacía lo marca como obligatorio', () => {
      renderLogin();
      fireEvent.blur(screen.getByLabelText('Contraseña'));
      expect(screen.getByText(/La contraseña es obligatoria/i)).toBeInTheDocument();
    });

    it('escribir en un campo limpia su error previo', () => {
      renderLogin();
      fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
      expect(screen.getByText(/El correo electrónico es obligatorio/i)).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
        target: { name: 'correo', value: 'juan@duoc.cl' },
      });
      expect(screen.queryByText(/El correo electrónico es obligatorio/i)).toBeNull();
    });

    it('los inputs inválidos quedan marcados con aria-invalid', () => {
      renderLogin();
      fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
      expect(screen.getByLabelText('Correo Electrónico')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('envío del formulario', () => {
    it('con campos vacíos muestra ambos errores y no navega', () => {
      renderLogin();
      fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
      expect(screen.getByText(/El correo electrónico es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/La contraseña es obligatoria/i)).toBeInTheDocument();
      expect(screen.queryByText('Pantalla de Inicio')).toBeNull();
    });

    it('con un correo inexistente muestra alerta de cuenta no registrada', () => {
      renderLogin();
      completarFormulario('noexiste@duoc.cl', 'Secret1!');
      fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
      expect(screen.getByText(/No existe una cuenta registrada/i)).toBeInTheDocument();
      expect(screen.queryByText('Pantalla de Inicio')).toBeNull();
    });

    it('con contraseña incorrecta muestra alerta de contraseña inválida', () => {
      registrarUsuario();
      renderLogin();
      completarFormulario('juan@duoc.cl', 'ClaveErronea1!');
      fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
      expect(screen.getByText(/La contraseña es incorrecta/i)).toBeInTheDocument();
      expect(screen.queryByText('Pantalla de Inicio')).toBeNull();
    });

    it('escribir tras una alerta de error la elimina', () => {
      renderLogin();
      completarFormulario('noexiste@duoc.cl', 'Secret1!');
      fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
      expect(screen.getByText(/No existe una cuenta registrada/i)).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
        target: { name: 'correo', value: 'otro@duoc.cl' },
      });
      expect(screen.queryByText(/No existe una cuenta registrada/i)).toBeNull();
    });

    it('con credenciales válidas navega a Inicio', () => {
      registrarUsuario();
      renderLogin();
      completarFormulario('juan@duoc.cl', 'Secret1!');
      fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
      expect(screen.getByText('Pantalla de Inicio')).toBeInTheDocument();
      expect(screen.queryByText(/La contraseña es incorrecta/i)).toBeNull();
    });

    it('acepta el correo en mayúsculas porque se normaliza', () => {
      registrarUsuario();
      renderLogin();
      completarFormulario('JUAN@DUOC.CL', 'Secret1!');
      fireEvent.click(screen.getByRole('button', { name: /Ingresar a mi cuenta/i }));
      expect(screen.getByText('Pantalla de Inicio')).toBeInTheDocument();
    });
  });
});
