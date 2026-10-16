import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Inicio from '../src/Pages/Inicio';
import { getProductos, crearProducto } from '../src/services/productos';
import { registerUser, loginUser, logout } from '../src/services/auth';
import { vaciarCarrito, contarCarrito } from '../src/services/carrito';

function renderInicio() {
  return render(
    <MemoryRouter>
      <Inicio />
    </MemoryRouter>,
  );
}

function loginComoAdmin() {
  registerUser({
    nombre: 'Admin Duoc',
    correo: 'admin@duocuc.cl',
    contrasena: 'Secret1!',
    telefono: '',
    region: 'Metropolitana de Santiago',
    comuna: 'Santiago',
  });
  loginUser('admin@duocuc.cl', 'Secret1!');
}

function loginComoUsuarioNormal() {
  registerUser({
    nombre: 'Juan Perez',
    correo: 'juan@duoc.cl',
    contrasena: 'Secret1!',
    telefono: '',
    region: 'Metropolitana de Santiago',
    comuna: 'Santiago',
  });
  loginUser('juan@duoc.cl', 'Secret1!');
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
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
    getProductos();
    vaciarCarrito();
    logout();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('sección hero y catálogo', () => {
    it('renderiza el hero con título, texto y CTA', () => {
      renderInicio();
      expect(screen.getByText(/ELEVA TU NIVEL/i)).toBeInTheDocument();
      expect(screen.getByText(/envíos rápidos y seguros a todo Chile/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Ver Productos/i })).toHaveAttribute(
        'href',
        '#catalogo',
      );
    });

    it('renderiza el catálogo con todos los productos iniciales', () => {
      renderInicio();
      const productos = getProductos();
      expect(productos.length).toBeGreaterThan(0);
      productos.forEach((producto) => {
        expect(screen.getByText(producto.nombre)).toBeInTheDocument();
      });
    });

    it('cada tarjeta muestra categoría, descripción y precio formateado', () => {
      renderInicio();
      const tarjeta = screen.getByText('Catan').closest('article');
      expect(tarjeta).toHaveTextContent('Juegos de Mesa');
      expect(tarjeta).toHaveTextContent(/Clásico juego de estrategia/i);
      expect(tarjeta).toHaveTextContent(/\$29\.990/);
    });

    it('refleja cambios del catálogo realizados fuera del componente', () => {
      renderInicio();
      act(() => {
        crearProducto({
          categoria: 'Mouse',
          nombre: 'Mouse Sync',
          descripcion: 'Producto agregado por el servicio',
          imagen: 'https://example.com/mouse.jpg',
          precio: 5000,
        });
      });
      expect(screen.getByText('Mouse Sync')).toBeInTheDocument();
    });
  });

  describe('agregar al carrito', () => {
    it('agrega el producto al carrito y muestra toast de confirmación', () => {
      renderInicio();
      expect(contarCarrito()).toBe(0);
      fireEvent.click(screen.getAllByRole('button', { name: /Añadir/i })[0]);
      expect(contarCarrito()).toBe(1);
      expect(screen.getByRole('status')).toHaveTextContent(/se agregó al carrito/i);
    });

    it('el toast se oculta automáticamente a los 2 segundos', () => {
      vi.useFakeTimers();
      renderInicio();
      fireEvent.click(screen.getAllByRole('button', { name: /Añadir/i })[0]);
      expect(screen.getByRole('status')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  describe('permisos de administración', () => {
    it('sin sesión no muestra panel admin ni acciones por producto', () => {
      renderInicio();
      expect(screen.queryByText(/PANEL DE ADMINISTRACIÓN/i)).toBeNull();
      expect(screen.queryByRole('button', { name: /Editar/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /Eliminar/i })).toBeNull();
    });

    it('usuario normal logueado no ve el panel admin', () => {
      loginComoUsuarioNormal();
      renderInicio();
      expect(screen.queryByText(/PANEL DE ADMINISTRACIÓN/i)).toBeNull();
      expect(screen.queryByRole('button', { name: /Editar/i })).toBeNull();
    });

    it('admin ve el panel y las acciones Editar/Eliminar en cada tarjeta', () => {
      loginComoAdmin();
      renderInicio();
      expect(screen.getByText(/PANEL DE ADMINISTRACIÓN/i)).toBeInTheDocument();
      const totalProductos = getProductos().length;
      expect(screen.getAllByRole('button', { name: /Editar/i })).toHaveLength(totalProductos);
      expect(screen.getAllByRole('button', { name: /Eliminar/i })).toHaveLength(totalProductos);
    });
  });

  describe('CRUD de productos (admin)', () => {
    it('agrega un producto válido y muestra toast de éxito', () => {
      loginComoAdmin();
      renderInicio();
      const datos = llenarFormularioProducto();
      fireEvent.click(screen.getByRole('button', { name: /Agregar producto/i }));
      expect(screen.getByText(datos.nombre)).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/agregado al catálogo/i);
      // El formulario se resetea después de agregar.
      expect(screen.getByPlaceholderText(/Nintendo Switch 2/i)).toHaveValue('');
    });

    it('muestra el primer error de validación al enviar el formulario vacío', () => {
      loginComoAdmin();
      renderInicio();
      fireEvent.click(screen.getByRole('button', { name: /Agregar producto/i }));
      // crearProducto valida en orden y reporta el primer error encontrado.
      expect(screen.getByText('La categoría es obligatoria.')).toBeInTheDocument();
      expect(screen.queryByRole('status')).toBeNull();
    });

    it('rechaza una imagen que no sea un link válido', () => {
      loginComoAdmin();
      renderInicio();
      llenarFormularioProducto({ imagen: 'no-es-un-link' });
      fireEvent.click(screen.getByRole('button', { name: /Agregar producto/i }));
      expect(screen.getByText(/La imagen debe ser un link válido/i)).toBeInTheDocument();
    });

    it('el botón Editar precarga el formulario y actualiza el producto', () => {
      loginComoAdmin();
      renderInicio();
      fireEvent.click(screen.getAllByRole('button', { name: /Editar/i })[0]);
      // Precarga los datos de Catan en el formulario.
      expect(screen.getByPlaceholderText(/Nintendo Switch 2/i)).toHaveValue('Catan');
      expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText(/Nintendo Switch 2/i), {
        target: { name: 'nombre', value: 'Catan Edición Ultra' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

      expect(screen.getByText('Catan Edición Ultra')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/actualizado correctamente/i);
    });

    it('el botón Cancelar sale del modo edición sin modificar el producto', () => {
      loginComoAdmin();
      renderInicio();
      fireEvent.click(screen.getAllByRole('button', { name: /Editar/i })[0]);
      fireEvent.change(screen.getByPlaceholderText(/Nintendo Switch 2/i), {
        target: { name: 'nombre', value: 'No Debería Guardarse' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
      expect(screen.getByRole('button', { name: /Agregar producto/i })).toBeInTheDocument();
      expect(screen.queryByText('No Debería Guardarse')).toBeNull();
      expect(screen.getByText('Catan')).toBeInTheDocument();
    });

    it('Eliminar con confirmación borrará el producto del catálogo', () => {
      loginComoAdmin();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      renderInicio();
      fireEvent.click(screen.getAllByRole('button', { name: /Eliminar/i })[0]);
      expect(window.confirm).toHaveBeenCalledWith('¿Eliminar "Catan" del catálogo?');
      expect(screen.queryByText('Catan')).toBeNull();
      expect(screen.getByRole('status')).toHaveTextContent(/eliminado/i);
    });

    it('Eliminar con cancelación no borra nada', () => {
      loginComoAdmin();
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      renderInicio();
      fireEvent.click(screen.getAllByRole('button', { name: /Eliminar/i })[0]);
      expect(screen.getByText('Catan')).toBeInTheDocument();
      expect(screen.queryByRole('status')).toBeNull();
    });
  });
});
