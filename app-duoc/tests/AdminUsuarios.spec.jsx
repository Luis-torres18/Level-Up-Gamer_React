import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import AdminUsuarios from '../src/Pages/AdminUsuarios';
import { getSession } from '../src/services/auth';
import { guardarSesion } from '../src/services/sesion';
import { ADMIN, crearFakeApi, tokenPara } from './helpers/fakeApi';

async function renderPagina() {
  const vista = render(
    <MemoryRouter>
      <AdminUsuarios />
    </MemoryRouter>,
  );
  await act(async () => {});
  return vista;
}

async function clicYEsperar(elemento) {
  await act(async () => {
    fireEvent.click(elemento);
  });
}

const cambiar = (etiqueta, valor) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

const fila = (correo) => screen.getByRole('cell', { name: correo }).closest('tr');

describe('pantalla Gestión de usuarios (ADMIN)', () => {
  let api;

  beforeEach(() => {
    localStorage.clear();
    api = crearFakeApi();
    guardarSesion(tokenPara(api, ADMIN));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listado', () => {
    it('lista los usuarios registrados con GET /api/usuarios', async () => {
      await renderPagina();

      expect(screen.getByRole('heading', { name: 'GESTIÓN DE USUARIOS' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'admin@duocuc.cl' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'juan@gmail.com' })).toBeInTheDocument();
      expect(api.peticiones[0]).toMatchObject({ metodo: 'GET', url: '/api/usuarios' });
    });

    it('muestra contadores de usuarios, administradores y clientes', async () => {
      await renderPagina();
      const stats = document.querySelector('.admin-stats');
      expect(stats).toHaveTextContent('2Usuarios');
      expect(stats).toHaveTextContent('1Administradores');
      expect(stats).toHaveTextContent('1Clientes');
    });

    it('marca la cuenta propia y no permite eliminarla', async () => {
      await renderPagina();
      expect(within(fila('admin@duocuc.cl')).getByText('(tú)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Eliminar a Administrador' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Eliminar a Juan Perez' })).toBeEnabled();
    });

    it('busca por nombre o correo y filtra por rol', async () => {
      await renderPagina();

      fireEvent.change(screen.getByLabelText('Buscar usuarios'), { target: { value: 'JUAN' } });
      expect(screen.queryByRole('cell', { name: 'admin@duocuc.cl' })).toBeNull();
      expect(screen.getByRole('cell', { name: 'juan@gmail.com' })).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Buscar usuarios'), { target: { value: '' } });
      fireEvent.change(screen.getByLabelText('Filtrar por rol'), { target: { value: 'ADMIN' } });
      expect(screen.queryByRole('cell', { name: 'juan@gmail.com' })).toBeNull();

      fireEvent.change(screen.getByLabelText('Buscar usuarios'), { target: { value: 'nadie' } });
      expect(screen.getByText('No hay usuarios que coincidan con la búsqueda.')).toBeInTheDocument();
    });

    it('si la API falla muestra el error y permite reintentar', async () => {
      api.sinConexion = true;
      await renderPagina();
      expect(screen.getByRole('alert')).toHaveTextContent(/No se pudo conectar/);

      api.sinConexion = false;
      await clicYEsperar(screen.getByRole('button', { name: 'Reintentar' }));
      expect(screen.getByRole('cell', { name: 'juan@gmail.com' })).toBeInTheDocument();
    });

    it('tiene un acceso a la gestión de productos', async () => {
      await renderPagina();
      expect(screen.getByRole('link', { name: 'Gestionar productos' })).toHaveAttribute(
        'href',
        '/Inicio#admin-productos',
      );
    });
  });

  describe('crear usuario', () => {
    it('valida los campos antes de llamar a la API', async () => {
      await renderPagina();
      const peticiones = api.peticiones.length;
      fireEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }));
      await clicYEsperar(screen.getByRole('button', { name: 'Crear usuario' }));

      expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
      expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument();
      expect(screen.getByText('Debes seleccionar tu región.')).toBeInTheDocument();
      expect(api.peticiones).toHaveLength(peticiones);

      cambiar('Nombre completo', 'Ana');
      expect(screen.queryByText('El nombre es obligatorio.')).toBeNull();
    });

    it('crea un usuario con POST eligiendo región, comuna y rol', async () => {
      await renderPagina();
      fireEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }));
      expect(screen.getByLabelText('Comuna')).toBeDisabled();

      cambiar('Nombre completo', 'Ana Torres');
      cambiar('Correo electrónico', 'ana@gmail.com');
      cambiar('Contraseña', 'Clave123!');
      cambiar('Región', 'Valparaíso');
      cambiar('Comuna', 'Viña del Mar');
      cambiar('Rol', 'ADMIN');
      await clicYEsperar(screen.getByRole('button', { name: 'Crear usuario' }));

      expect(screen.getByRole('status')).toHaveTextContent('Usuario "Ana Torres" creado correctamente.');
      expect(within(fila('ana@gmail.com')).getByText('ADMIN')).toBeInTheDocument();
      expect(api.peticiones.at(-1)).toMatchObject({ metodo: 'POST', url: '/api/usuarios' });
      expect(screen.queryByRole('button', { name: 'Crear usuario' })).toBeNull();
    });

    it('muestra el error del backend si el correo ya existe', async () => {
      await renderPagina();
      fireEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }));
      cambiar('Nombre completo', 'Otro Juan');
      cambiar('Correo electrónico', 'juan@gmail.com');
      cambiar('Contraseña', 'Clave123!');
      cambiar('Región', 'Valparaíso');
      cambiar('Comuna', 'Viña del Mar');
      await clicYEsperar(screen.getByRole('button', { name: 'Crear usuario' }));

      expect(screen.getByText('Ya existe una cuenta registrada con este correo electrónico.')).toBeInTheDocument();

      cambiar('Correo electrónico', 'otro@gmail.com');
      expect(screen.queryByText('Ya existe una cuenta registrada con este correo electrónico.')).toBeNull();
    });

    it('Cancelar cierra el formulario', async () => {
      await renderPagina();
      fireEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(screen.queryByRole('button', { name: 'Crear usuario' })).toBeNull();
    });
  });

  describe('editar usuario', () => {
    it('precarga los datos y actualiza nombre y rol con PUT', async () => {
      await renderPagina();
      fireEvent.click(screen.getByRole('button', { name: 'Editar a Juan Perez' }));

      expect(screen.getByLabelText('Nombre completo')).toHaveValue('Juan Perez');
      expect(screen.getByLabelText('Región')).toHaveValue('Valparaíso');
      expect(screen.getByLabelText('Comuna')).toHaveValue('Viña del Mar');
      expect(screen.getByLabelText('Nueva contraseña (opcional)')).toHaveValue('');

      cambiar('Nombre completo', 'Juan Editado');
      cambiar('Rol', 'ADMIN');
      await clicYEsperar(screen.getByRole('button', { name: 'Guardar cambios' }));

      expect(screen.getByRole('status')).toHaveTextContent('Usuario "Juan Editado" actualizado correctamente.');
      expect(within(fila('juan@gmail.com')).getByText('ADMIN')).toBeInTheDocument();
      expect(api.peticiones.at(-1)).toMatchObject({ metodo: 'PUT', url: '/api/usuarios/2' });
      expect(api.peticiones.at(-1).body.contrasena).toBe('');
    });

    it('valida la nueva contraseña solo si se escribe una', async () => {
      await renderPagina();
      fireEvent.click(screen.getByRole('button', { name: 'Editar a Juan Perez' }));
      cambiar('Nueva contraseña (opcional)', 'debil');
      await clicYEsperar(screen.getByRole('button', { name: 'Guardar cambios' }));
      expect(screen.getByText(/al menos 8 caracteres/)).toBeInTheDocument();
    });

    it('cambiar la región limpia la comuna', async () => {
      await renderPagina();
      fireEvent.click(screen.getByRole('button', { name: 'Editar a Juan Perez' }));
      cambiar('Región', 'Metropolitana de Santiago');
      expect(screen.getByLabelText('Comuna')).toHaveValue('');
    });

    it('conserva una región que no está en la lista', async () => {
      api.usuarios[1].region = 'Región Antigua';
      api.usuarios[1].comuna = 'Comuna Antigua';
      await renderPagina();
      fireEvent.click(screen.getByRole('button', { name: 'Editar a Juan Perez' }));
      expect(screen.getByLabelText('Región')).toHaveValue('Región Antigua');
      expect(screen.getByLabelText('Comuna')).toHaveValue('Comuna Antigua');
    });

    it('al editarse a sí mismo no puede cambiar su rol y se actualiza su sesión', async () => {
      await renderPagina();
      fireEvent.click(screen.getByRole('button', { name: 'Editar a Administrador' }));
      expect(screen.getByLabelText('Rol')).toBeDisabled();
      expect(screen.getByText('No puedes quitarte tu propio rol de administrador.')).toBeInTheDocument();

      cambiar('Nombre completo', 'Jefa Admin');
      await clicYEsperar(screen.getByRole('button', { name: 'Guardar cambios' }));

      expect(getSession().nombre).toBe('Jefa Admin');
    });
  });

  describe('eliminar usuario', () => {
    it('con confirmación elimina la cuenta con DELETE', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      await renderPagina();
      await clicYEsperar(screen.getByRole('button', { name: 'Eliminar a Juan Perez' }));

      expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('juan@gmail.com'));
      expect(screen.queryByRole('cell', { name: 'juan@gmail.com' })).toBeNull();
      expect(screen.getByRole('status')).toHaveTextContent('Cuenta de "Juan Perez" eliminada.');
      expect(api.peticiones.at(-1)).toMatchObject({ metodo: 'DELETE', url: '/api/usuarios/2' });
    });

    it('si se estaba editando ese usuario, cierra el formulario', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      await renderPagina();
      fireEvent.click(screen.getByRole('button', { name: 'Editar a Juan Perez' }));
      await clicYEsperar(screen.getByRole('button', { name: 'Eliminar a Juan Perez' }));
      expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
    });

    it('sin confirmación no elimina nada', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      await renderPagina();
      const peticiones = api.peticiones.length;
      await clicYEsperar(screen.getByRole('button', { name: 'Eliminar a Juan Perez' }));
      expect(screen.getByRole('cell', { name: 'juan@gmail.com' })).toBeInTheDocument();
      expect(api.peticiones).toHaveLength(peticiones);
    });

    it('muestra el error si la API no puede eliminar', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      await renderPagina();
      api.usuarios = api.usuarios.filter((usuario) => usuario.id !== 2);
      await clicYEsperar(screen.getByRole('button', { name: 'Eliminar a Juan Perez' }));
      expect(screen.getByRole('status')).toHaveTextContent('El usuario no existe.');
    });
  });
});
