import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import Inicio from '../src/Pages/inicio';
import { logout } from '../src/services/auth';
import { contarCarrito, vaciarCarrito } from '../src/services/carrito';
import { cargarProductos } from '../src/services/productos';
import { guardarSesion } from '../src/services/sesion';
import { ADMIN, CLIENTE, PRODUCTOS_BASE, crearFakeApi, tokenPara } from './helpers/fakeApi';

// Renderiza y espera a que llegue el catálogo (GET /api/productos).
async function renderInicio(entrada = '/Inicio') {
  const vista = render(
    <MemoryRouter initialEntries={[entrada]}>
      <Inicio />
    </MemoryRouter>,
  );
  await act(async () => {});
  return vista;
}

// Espera a que terminen las peticiones disparadas por un clic (POST/PUT/DELETE).
async function clicYEsperar(elemento) {
  await act(async () => {
    fireEvent.click(elemento);
  });
}

function llenarFormularioProducto(overrides = {}) {
  const datos = {
    categoria: 'Accesorios',
    nombre: 'Teclado Test',
    descripcion: 'Teclado de prueba para el unit test',
    imagen: 'https://example.com/teclado.jpg',
    precio: '1000',
    ...overrides,
  };
  fireEvent.change(screen.getByLabelText(/Categor.a/i), {
    target: { name: 'categoria', value: datos.categoria },
  });
  fireEvent.change(screen.getByPlaceholderText(/Nintendo Switch 2/i), {
    target: { name: 'nombre', value: datos.nombre },
  });
  fireEvent.change(screen.getByPlaceholderText(/Breve descripci.n/i), {
    target: { name: 'descripcion', value: datos.descripcion },
  });
  fireEvent.change(screen.getByPlaceholderText(/https:\/\/ejemplo/i), {
    target: { name: 'imagen', value: datos.imagen },
  });
  fireEvent.change(screen.getByPlaceholderText(/49990/i), {
    target: { name: 'precio', value: datos.precio },
  });
  return datos;
}

describe('pagina Inicio', () => {
  let api;

  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    api = crearFakeApi();
    vaciarCarrito();
    logout();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const loginComo = (usuario) => guardarSesion(tokenPara(api, usuario));

  describe('sección hero y catálogo', () => {
    it('renderiza el hero con título, texto y CTA', async () => {
      await renderInicio();
      expect(screen.getByText(/ELEVA TU NIVEL/i)).toBeInTheDocument();
      expect(screen.getByText(/envíos rápidos y seguros a todo Chile/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Ver Productos/i })).toHaveAttribute('href', '#catalogo');
    });

    it('muestra los productos que entrega la API', async () => {
      await renderInicio();
      PRODUCTOS_BASE.forEach((producto) => {
        expect(screen.getByText(producto.nombre)).toBeInTheDocument();
      });
      expect(api.peticiones[0]).toMatchObject({ metodo: 'GET', url: '/api/productos' });
    });

    it('cada tarjeta muestra categoría, descripción y precio formateado', async () => {
      await renderInicio();
      const tarjeta = screen.getByText('Catan').closest('article');
      expect(tarjeta).toHaveTextContent('Juegos de Mesa');
      expect(tarjeta).toHaveTextContent(/Clásico juego de estrategia/i);
      expect(tarjeta).toHaveTextContent(/\$29\.990/);
    });

    it('muestra un mensaje mientras carga el catálogo', async () => {
      // Catálogo vacío en caché: se ve el estado "cargando" hasta que responde la API.
      api.productos = [];
      await cargarProductos();
      api.productos = PRODUCTOS_BASE.map((producto) => ({ ...producto }));
      render(
        <MemoryRouter>
          <Inicio />
        </MemoryRouter>,
      );
      expect(screen.getByText('Cargando catálogo...')).toBeInTheDocument();
      expect(await screen.findByText('Catan')).toBeInTheDocument();
    });

    it('avisa cuando el catálogo está vacío', async () => {
      api.productos = [];
      await renderInicio();
      expect(screen.getByText('Aún no hay productos en el catálogo.')).toBeInTheDocument();
    });

    it('si la API no responde muestra el error y permite reintentar', async () => {
      api.sinConexion = true;
      await renderInicio();
      expect(screen.getByRole('alert')).toHaveTextContent(/No se pudo conectar con el servidor/);

      api.sinConexion = false;
      await clicYEsperar(screen.getByRole('button', { name: 'Reintentar' }));
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.getByText('Catan')).toBeInTheDocument();
    });

    it('refleja cambios del catálogo realizados fuera del componente', async () => {
      await renderInicio();
      api.productos.push({ ...PRODUCTOS_BASE[0], id: 50, nombre: 'Mouse Sync' });
      await act(async () => {
        await cargarProductos();
      });
      expect(screen.getByText('Mouse Sync')).toBeInTheDocument();
    });
  });

  describe('agregar al carrito', () => {
    it('agrega el producto al carrito y muestra toast de confirmación', async () => {
      await renderInicio();
      expect(contarCarrito()).toBe(0);
      fireEvent.click(screen.getAllByRole('button', { name: /Añadir/i })[0]);
      expect(contarCarrito()).toBe(1);
      expect(screen.getByRole('status')).toHaveTextContent(/se agregó al carrito/i);
    });

    it('el toast se oculta automáticamente a los 2 segundos', async () => {
      await renderInicio();
      vi.useFakeTimers();
      fireEvent.click(screen.getAllByRole('button', { name: /Añadir/i })[0]);
      expect(screen.getByRole('status')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  describe('permisos según el rol', () => {
    it('sin sesión no muestra panel admin ni acciones por producto', async () => {
      await renderInicio();
      expect(screen.queryByText(/PANEL DE ADMINISTRACIÓN/i)).toBeNull();
      expect(screen.queryByRole('button', { name: /Editar/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /Eliminar/i })).toBeNull();
    });

    it('un CLIENTE no ve el panel admin', async () => {
      loginComo(CLIENTE);
      await renderInicio();
      expect(screen.queryByText(/PANEL DE ADMINISTRACIÓN/i)).toBeNull();
      expect(screen.queryByRole('button', { name: /Editar/i })).toBeNull();
    });

    it('un ADMIN ve el panel y las acciones Editar/Eliminar en cada tarjeta', async () => {
      loginComo(ADMIN);
      await renderInicio();
      expect(screen.getByText(/PANEL DE ADMINISTRACIÓN/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Editar/i })).toHaveLength(PRODUCTOS_BASE.length);
      expect(screen.getAllByRole('button', { name: /Eliminar/i })).toHaveLength(PRODUCTOS_BASE.length);
    });

    it('el panel desaparece al cerrar sesión', async () => {
      loginComo(ADMIN);
      await renderInicio();
      act(() => logout());
      expect(screen.queryByText(/PANEL DE ADMINISTRACIÓN/i)).toBeNull();
    });

    it('con el ancla #admin-productos baja hasta el panel', async () => {
      loginComo(ADMIN);
      const scroll = vi.spyOn(Element.prototype, 'scrollIntoView');
      await renderInicio('/Inicio#admin-productos');
      expect(scroll).toHaveBeenCalled();
    });
  });

  describe('CRUD de productos (ADMIN contra la API)', () => {
    beforeEach(() => {
      loginComo(ADMIN);
    });

    it('agrega un producto (POST) y muestra toast de éxito', async () => {
      await renderInicio();
      const datos = llenarFormularioProducto();
      await clicYEsperar(screen.getByRole('button', { name: /Agregar producto/i }));

      expect(screen.getByText(datos.nombre)).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/agregado al catálogo/i);
      expect(screen.getByPlaceholderText(/Nintendo Switch 2/i)).toHaveValue('');
      expect(api.peticiones.at(-1)).toMatchObject({ metodo: 'POST', url: '/api/productos' });
      expect(api.productos).toHaveLength(PRODUCTOS_BASE.length + 1);
    });

    it('muestra el primer error de validación al enviar el formulario vacío', async () => {
      await renderInicio();
      await clicYEsperar(screen.getByRole('button', { name: /Agregar producto/i }));
      expect(screen.getByText('La categoría es obligatoria.')).toBeInTheDocument();
      expect(screen.queryByRole('status')).toBeNull();
    });

    it('rechaza una imagen que no sea un link válido', async () => {
      await renderInicio();
      llenarFormularioProducto({ imagen: 'no-es-un-link' });
      await clicYEsperar(screen.getByRole('button', { name: /Agregar producto/i }));
      expect(screen.getByText(/La imagen debe ser un link válido/i)).toBeInTheDocument();
    });

    it('si el token venció cierra la sesión, oculta el panel y lo avisa', async () => {
      await renderInicio();
      api.tokens.clear();
      llenarFormularioProducto();
      await clicYEsperar(screen.getByRole('button', { name: /Agregar producto/i }));
      expect(screen.getByRole('status')).toHaveTextContent('Debes iniciar sesión para realizar esta acción.');
      expect(screen.queryByText(/PANEL DE ADMINISTRACIÓN/i)).toBeNull();
    });

    it('el botón Editar precarga el formulario y actualiza el producto (PUT)', async () => {
      await renderInicio();
      fireEvent.click(screen.getAllByRole('button', { name: /Editar/i })[0]);
      expect(screen.getByPlaceholderText(/Nintendo Switch 2/i)).toHaveValue('Catan');

      fireEvent.change(screen.getByPlaceholderText(/Nintendo Switch 2/i), {
        target: { name: 'nombre', value: 'Catan Edición Ultra' },
      });
      await clicYEsperar(screen.getByRole('button', { name: /Guardar cambios/i }));

      expect(screen.getByText('Catan Edición Ultra')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/actualizado correctamente/i);
      expect(api.peticiones.at(-1)).toMatchObject({ metodo: 'PUT', url: '/api/productos/1' });
    });

    it('el botón Cancelar sale del modo edición sin modificar el producto', async () => {
      await renderInicio();
      fireEvent.click(screen.getAllByRole('button', { name: /Editar/i })[0]);
      fireEvent.change(screen.getByPlaceholderText(/Nintendo Switch 2/i), {
        target: { name: 'nombre', value: 'No Debería Guardarse' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
      expect(screen.getByRole('button', { name: /Agregar producto/i })).toBeInTheDocument();
      expect(screen.queryByText('No Debería Guardarse')).toBeNull();
      expect(screen.getByText('Catan')).toBeInTheDocument();
    });

    it('Eliminar con confirmación borra el producto (DELETE)', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      await renderInicio();
      await clicYEsperar(screen.getAllByRole('button', { name: /Eliminar/i })[0]);
      expect(window.confirm).toHaveBeenCalledWith('¿Eliminar "Catan" del catálogo?');
      expect(screen.queryByText('Catan')).toBeNull();
      expect(screen.getByRole('status')).toHaveTextContent(/eliminado/i);
      expect(api.peticiones.at(-1)).toMatchObject({ metodo: 'DELETE', url: '/api/productos/1' });
    });

    it('Eliminar muestra el error si la API falla', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      await renderInicio();
      api.productos = api.productos.filter((producto) => producto.id !== 1);
      await clicYEsperar(screen.getAllByRole('button', { name: /Eliminar/i })[0]);
      expect(screen.getByText('El producto no existe en el catálogo.')).toBeInTheDocument();
    });

    it('Eliminar con cancelación no borra nada', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      await renderInicio();
      fireEvent.click(screen.getAllByRole('button', { name: /Eliminar/i })[0]);
      expect(screen.getByText('Catan')).toBeInTheDocument();
      expect(screen.queryByRole('status')).toBeNull();
    });
  });
});
