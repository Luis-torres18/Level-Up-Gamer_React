// Backend falso en memoria para las pruebas.
// Reemplaza el "adapter" de los 3 clientes axios, así las pruebas pasan por los servicios
// reales, los interceptores (token JWT, cierre de sesión con 401) y los mensajes de error,
// pero sin red. Replica las reglas de los microservicios (roles, 401/403/404/409).
import { AxiosError } from 'axios';

import { apiGestion, apiProductos, apiUsuarios } from '../../src/services/api';

export const PRODUCTOS_BASE = [
  {
    id: 1,
    categoria: 'Juegos de Mesa',
    nombre: 'Catan',
    descripcion: 'Clásico juego de estrategia.',
    imagen: 'https://example.com/catan.jpg',
    precio: 29990,
  },
  {
    id: 2,
    categoria: 'Consolas',
    nombre: 'PlayStation 5',
    descripcion: 'Gráficos 4K con trazado de rayos.',
    imagen: 'https://example.com/ps5.jpg',
    precio: 549990,
  },
  {
    id: 3,
    categoria: 'Mouse',
    nombre: 'Logitech G502 HERO',
    descripcion: 'Sensor de alta precisión.',
    imagen: 'https://example.com/g502.jpg',
    precio: 49990,
  },
];

export const ADMIN = {
  id: 1,
  nombre: 'Administrador',
  correo: 'admin@duocuc.cl',
  contrasena: 'Admin123!',
  telefono: null,
  region: 'Metropolitana de Santiago',
  comuna: 'Santiago',
  rol: 'ADMIN',
  descuentoDuoc: true,
  creadoEl: '2026-11-01T10:00:00',
};

export const CLIENTE = {
  id: 2,
  nombre: 'Juan Perez',
  correo: 'juan@gmail.com',
  contrasena: 'Clave123!',
  telefono: '912345678',
  region: 'Valparaíso',
  comuna: 'Viña del Mar',
  rol: 'CLIENTE',
  descuentoDuoc: false,
  creadoEl: '2026-11-05T12:30:00',
};

const publico = (usuario) => {
  const copia = { ...usuario };
  delete copia.contrasena;
  return copia;
};
const esDuoc = (correo) => correo.endsWith('@duoc.cl') || correo.endsWith('@duocuc.cl');

function responder(config, status, datos) {
  // Copia los datos como lo haría una respuesta HTTP real (JSON), sin compartir referencias.
  const data = datos === '' ? '' : JSON.parse(JSON.stringify(datos));
  const response = { data, status, statusText: String(status), headers: {}, config, request: {} };
  if (status >= 400) {
    throw new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response);
  }
  return response;
}

const mensaje = (config, status, texto) => responder(config, status, { mensaje: texto });

export function crearFakeApi() {
  const estado = {
    productos: PRODUCTOS_BASE.map((producto) => ({ ...producto })),
    usuarios: [{ ...ADMIN }, { ...CLIENTE }],
    tokens: new Map(),
    seqProducto: 100,
    seqUsuario: 100,
    sinConexion: false,
    peticiones: [],
  };

  function usuarioDelToken(config) {
    const header = config.headers?.Authorization ?? config.headers?.authorization ?? '';
    const id = estado.tokens.get(String(header).replace('Bearer ', ''));
    return estado.usuarios.find((usuario) => usuario.id === id) ?? null;
  }

  function exigirAdmin(config, yo) {
    if (!yo) return mensaje(config, 401, 'Debes iniciar sesión para realizar esta acción.');
    if (yo.rol !== 'ADMIN') return mensaje(config, 403, 'No tienes permisos para realizar esta acción.');
    return null;
  }

  function crearAdapter(manejador) {
    return async (config) => {
      const metodo = config.method.toUpperCase();
      const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : {};
      estado.peticiones.push({ metodo, url: config.url, body, auth: config.headers?.Authorization });
      if (estado.sinConexion) {
        throw new AxiosError('Network Error', 'ERR_NETWORK', config, {});
      }
      return manejador({ config, metodo, url: config.url, body, yo: usuarioDelToken(config) });
    };
  }

  const productos = crearAdapter(({ config, metodo, url, body, yo }) => {
    const id = Number(url.split('/')[3]) || null;
    if (metodo === 'GET') {
      if (!id) return responder(config, 200, estado.productos);
      const producto = estado.productos.find((item) => item.id === id);
      return producto
        ? responder(config, 200, producto)
        : mensaje(config, 404, 'El producto no existe en el catálogo.');
    }
    const denegado = exigirAdmin(config, yo);
    if (denegado) return denegado;

    if (metodo === 'DELETE') {
      if (!estado.productos.some((item) => item.id === id)) {
        return mensaje(config, 404, 'El producto no existe en el catálogo.');
      }
      estado.productos = estado.productos.filter((item) => item.id !== id);
      return responder(config, 204, '');
    }
    if (metodo === 'POST') {
      const nuevo = { id: estado.seqProducto++, ...body };
      estado.productos.push(nuevo);
      return responder(config, 201, nuevo);
    }
    const indice = estado.productos.findIndex((item) => item.id === id);
    if (indice < 0) return mensaje(config, 404, 'El producto no existe en el catálogo.');
    estado.productos[indice] = { id, ...body };
    return responder(config, 200, estado.productos[indice]);
  });

  const usuarios = crearAdapter(({ config, metodo, url, body, yo }) => {
    if (metodo === 'POST' && url === '/api/auth/registro') {
      if (estado.usuarios.some((usuario) => usuario.correo === body.correo)) {
        return mensaje(config, 409, 'Ya existe una cuenta registrada con este correo electrónico.');
      }
      const nuevo = {
        id: estado.seqUsuario++,
        ...body,
        rol: 'CLIENTE',
        descuentoDuoc: esDuoc(body.correo),
        creadoEl: '2026-11-10T09:00:00',
      };
      estado.usuarios.push(nuevo);
      return responder(config, 201, publico(nuevo));
    }
    if (metodo === 'POST' && url === '/api/auth/login') {
      const usuario = estado.usuarios.find((item) => item.correo === body.correo);
      if (!usuario || usuario.contrasena !== body.contrasena) {
        return mensaje(config, 401, 'Correo o contraseña incorrectos.');
      }
      const token = `token-${usuario.id}-${estado.tokens.size}`;
      estado.tokens.set(token, usuario.id);
      return responder(config, 200, { token, expiraEn: Date.now() + 3_600_000, usuario: publico(usuario) });
    }
    if (metodo === 'GET' && url === '/api/auth/perfil') {
      return yo ? responder(config, 200, publico(yo)) : mensaje(config, 401, 'Debes iniciar sesión.');
    }
    return mensaje(config, 404, 'Ruta no encontrada.');
  });

  const gestion = crearAdapter(({ config, metodo, url, body, yo }) => {
    const denegado = exigirAdmin(config, yo);
    if (denegado) return denegado;
    const id = Number(url.split('/')[3]) || null;

    if (metodo === 'GET') {
      if (!id) return responder(config, 200, estado.usuarios.map(publico));
      const usuario = estado.usuarios.find((item) => item.id === id);
      return usuario ? responder(config, 200, publico(usuario)) : mensaje(config, 404, 'El usuario no existe.');
    }
    if (metodo === 'DELETE') {
      if (id === yo.id) return mensaje(config, 400, 'No puedes eliminar tu propia cuenta.');
      if (!estado.usuarios.some((item) => item.id === id)) return mensaje(config, 404, 'El usuario no existe.');
      estado.usuarios = estado.usuarios.filter((item) => item.id !== id);
      return responder(config, 204, '');
    }
    const duplicado = estado.usuarios.some((item) => item.correo === body.correo && item.id !== id);
    if (duplicado) return mensaje(config, 409, 'Ya existe una cuenta registrada con este correo electrónico.');

    if (metodo === 'POST') {
      const nuevo = {
        id: estado.seqUsuario++,
        ...body,
        telefono: body.telefono || null,
        descuentoDuoc: esDuoc(body.correo),
        creadoEl: '2026-11-10T09:00:00',
      };
      estado.usuarios.push(nuevo);
      return responder(config, 201, publico(nuevo));
    }
    const usuario = estado.usuarios.find((item) => item.id === id);
    if (!usuario) return mensaje(config, 404, 'El usuario no existe.');
    if (id === yo.id && body.rol !== 'ADMIN') {
      return mensaje(config, 400, 'No puedes quitarte a ti mismo el rol de administrador.');
    }
    const { contrasena, ...resto } = body;
    Object.assign(usuario, resto, { telefono: body.telefono || null, descuentoDuoc: esDuoc(body.correo) });
    if (contrasena) usuario.contrasena = contrasena;
    return responder(config, 200, publico(usuario));
  });

  apiProductos.defaults.adapter = productos;
  apiUsuarios.defaults.adapter = usuarios;
  apiGestion.defaults.adapter = gestion;

  return estado;
}

// Inicia sesión "a mano" contra el backend falso y guarda el token (como hace loginUser).
export function tokenPara(estado, usuario) {
  const token = `token-${usuario.id}-manual-${estado.tokens.size}`;
  estado.tokens.set(token, usuario.id);
  return { token, expiraEn: Date.now() + 3_600_000, usuario: publico(usuario) };
}
