import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';
import Registro from '../src/Pages/registro';
import { REGIONES } from '../src/data/regiones';
import { registerUser, findUserByEmail } from '../src/services/auth';

// Stub que expone el state con el que se navegó hacia /Login.
function LoginStub() {
  const location = useLocation();
  return (
    <div>
      <p>Pantalla de Login</p>
      <p data-testid="login-state">{JSON.stringify(location.state ?? null)}</p>
    </div>
  );
}

function renderRegistro() {
  return render(
    <MemoryRouter initialEntries={['/Registro']}>
      <Routes>
        <Route path="/Registro" element={<Registro />} />
        <Route path="/Login" element={<LoginStub />} />
      </Routes>
    </MemoryRouter>,
  );
}

const VALOR_VALIDO = {
  nombre: 'Ignacio Morales',
  correo: 'nuevo@duoc.cl',
  confirmarCorreo: 'nuevo@duoc.cl',
  contrasena: 'Secret1!',
  confirmarContrasena: 'Secret1!',
  telefono: '+56 9 1234 5678',
  region: REGIONES[0].region,
  comuna: REGIONES[0].comunas[0],
};

function cambiarCampo(nombre, valor) {
  const campo = document.getElementsByName(nombre)[0];
  fireEvent.change(campo, { target: { name: nombre, value: valor } });
}

function llenarFormulario(overrides = {}) {
  const datos = { ...VALOR_VALIDO, ...overrides };
  Object.entries(datos).forEach(([nombre, valor]) => cambiarCampo(nombre, valor));
  return datos;
}

describe('pagina Registro', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  });

  describe('renderizado', () => {
    it('renderiza título, todos los campos y el enlace a login', () => {
      renderRegistro();
      expect(screen.getByText(/REGISTRO DE USUARIO/i)).toBeInTheDocument();
      ['nombre', 'correo', 'confirmarCorreo', 'contrasena', 'confirmarContrasena', 'telefono'].forEach(
        (nombre) => expect(document.getElementsByName(nombre)[0]).toBeInTheDocument(),
      );
      expect(screen.getByRole('combobox', { name: /Regi.n/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /Comuna/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Registrarse/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Inicia sesión aquí/i })).toHaveAttribute(
        'href',
        '/Login',
      );
    });

    it('lista todas las regiones disponibles en el select', () => {
      renderRegistro();
      const opciones = screen.getAllByRole('option').map((o) => o.textContent);
      REGIONES.forEach((item) => expect(opciones).toContain(item.region));
    });
  });

  describe('dependencia región → comuna', () => {
    it('la comuna está deshabilitada mientras no se elija región', () => {
      renderRegistro();
      expect(screen.getByRole('combobox', { name: /Comuna/i })).toBeDisabled();
      expect(screen.getByText(/Primero elija una región/i)).toBeInTheDocument();
    });

    it('al elegir región se habilita la comuna con sus comunas', () => {
      renderRegistro();
      fireEvent.change(screen.getByRole('combobox', { name: /Regi.n/i }), {
        target: { name: 'region', value: REGIONES[0].region },
      });
      const comuna = screen.getByRole('combobox', { name: /Comuna/i });
      expect(comuna).not.toBeDisabled();
      const opciones = screen.getAllByRole('option').map((o) => o.textContent);
      REGIONES[0].comunas.forEach((c) => expect(opciones).toContain(c));
    });

    it('cambiar de región limpia la comuna seleccionada', () => {
      renderRegistro();
      fireEvent.change(screen.getByRole('combobox', { name: /Regi.n/i }), {
        target: { name: 'region', value: REGIONES[0].region },
      });
      fireEvent.change(screen.getByRole('combobox', { name: /Comuna/i }), {
        target: { name: 'comuna', value: REGIONES[0].comunas[0] },
      });
      fireEvent.change(screen.getByRole('combobox', { name: /Regi.n/i }), {
        target: { name: 'region', value: REGIONES[1].region },
      });
      expect(screen.getByRole('combobox', { name: /Comuna/i })).toHaveValue('');
    });
  });

  describe('validación por campo (blur)', () => {
    it('nombre muy corto muestra error de longitud mínima', () => {
      renderRegistro();
      const nombre = screen.getByRole('textbox', { name: /Nombre Completo/i });
      fireEvent.change(nombre, { target: { name: 'nombre', value: 'ab' } });
      fireEvent.blur(nombre);
      expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
    });

    it('nombre con números muestra error de solo letras', () => {
      renderRegistro();
      const nombre = screen.getByRole('textbox', { name: /Nombre Completo/i });
      fireEvent.change(nombre, { target: { name: 'nombre', value: 'Juan 123' } });
      fireEvent.blur(nombre);
      expect(screen.getByText(/solo puede contener letras/i)).toBeInTheDocument();
    });

    it('correo inválido muestra error de formato', () => {
      renderRegistro();
      const correo = document.getElementsByName('correo')[0];
      fireEvent.change(correo, { target: { name: 'correo', value: 'basura@' } });
      fireEvent.blur(correo);
      expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
    });

    it('confirmar correo distinto muestra error de coincidencia', () => {
      renderRegistro();
      cambiarCampo('correo', 'juan@duoc.cl');
      const confirmar = document.getElementsByName('confirmarCorreo')[0];
      fireEvent.change(confirmar, { target: { name: 'confirmarCorreo', value: 'otro@duoc.cl' } });
      fireEvent.blur(confirmar);
      expect(screen.getByText(/Los correos electrónicos no coinciden/i)).toBeInTheDocument();
    });

    it('contraseña débil muestra los requisitos faltantes', () => {
      renderRegistro();
      const contrasena = document.getElementsByName('contrasena')[0];
      fireEvent.change(contrasena, { target: { name: 'contrasena', value: 'abcdefgh' } });
      fireEvent.blur(contrasena);
      expect(screen.getByText(/al menos una mayúscula/i)).toBeInTheDocument();
    });

    it('confirmar contraseña distinta muestra error de coincidencia', () => {
      renderRegistro();
      cambiarCampo('contrasena', 'Secret1!');
      const confirmar = document.getElementsByName('confirmarContrasena')[0];
      fireEvent.change(confirmar, {
        target: { name: 'confirmarContrasena', value: 'Secret2!' },
      });
      fireEvent.blur(confirmar);
      expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeInTheDocument();
    });

    it('teléfono con formato chileno inválido muestra error', () => {
      renderRegistro();
      const telefono = document.getElementsByName('telefono')[0];
      fireEvent.change(telefono, { target: { name: 'telefono', value: '555-1234' } });
      fireEvent.blur(telefono);
      expect(screen.getByText(/Formato inválido/i)).toBeInTheDocument();
    });

    it('el teléfono es opcional: dejarlo vacío no produce error', () => {
      renderRegistro();
      const telefono = document.getElementsByName('telefono')[0];
      fireEvent.blur(telefono);
      expect(screen.queryByText(/Formato inválido/i)).toBeNull();
    });

    it('escribir en un campo limpia su error previo', () => {
      renderRegistro();
      const nombre = screen.getByRole('textbox', { name: /Nombre Completo/i });
      fireEvent.change(nombre, { target: { name: 'nombre', value: 'ab' } });
      fireEvent.blur(nombre);
      expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
      fireEvent.change(nombre, { target: { name: 'nombre', value: 'Andrés Bravo' } });
      expect(screen.queryByText(/al menos 3 caracteres/i)).toBeNull();
    });
  });

  describe('envío del formulario', () => {
    it('con el formulario vacío muestra todos los errores y no registra', () => {
      renderRegistro();
      fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
      expect(screen.getByText(/El nombre es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/El correo electrónico es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/La contraseña es obligatoria/i)).toBeInTheDocument();
      expect(screen.getByText(/Debes seleccionar tu región/i)).toBeInTheDocument();
      expect(screen.queryByText('Pantalla de Login')).toBeNull();
    });

    it('con datos válidos registra al usuario y navega al Login con el estado correcto', () => {
      renderRegistro();
      const datos = llenarFormulario();
      fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

      expect(screen.getByText('Pantalla de Login')).toBeInTheDocument();
      const state = JSON.parse(screen.getByTestId('login-state').textContent);
      expect(state.registrado).toBe(true);
      expect(state.correo).toBe(datos.correo);

      const usuario = findUserByEmail(datos.correo);
      expect(usuario).not.toBeNull();
      expect(usuario.nombre).toBe(datos.nombre);
      expect(usuario.comuna).toBe(datos.comuna);
    });

    it('un correo repetido muestra error y no navega', () => {
      registerUser({
        nombre: 'Usuaria Previa',
        correo: 'repetido@duoc.cl',
        contrasena: 'Secret1!',
        telefono: '',
        region: REGIONES[0].region,
        comuna: REGIONES[0].comunas[0],
      });
      renderRegistro();
      llenarFormulario({
        correo: 'repetido@duoc.cl',
        confirmarCorreo: 'repetido@duoc.cl',
      });
      fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
      expect(screen.getByText(/Ya existe una cuenta registrada/i)).toBeInTheDocument();
      expect(screen.queryByText('Pantalla de Login')).toBeNull();
    });

    it('el correo @duoc.cl marca el descuento Duoc en el estado enviado', () => {
      renderRegistro();
      llenarFormulario({
        correo: 'estudiante@duoc.cl',
        confirmarCorreo: 'estudiante@duoc.cl',
      });
      fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
      const state = JSON.parse(screen.getByTestId('login-state').textContent);
      expect(state.descuentoDuoc).toBe(true);
    });
  });
});
