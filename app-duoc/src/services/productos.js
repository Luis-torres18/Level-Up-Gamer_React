const PRODUCTS_KEY = 'lug_productos';
const PRODUCTS_EVENT = 'lug-productos-change';

const PRODUCTOS_INICIALES = [
  {
    id: 'JM001',
    categoria: 'Juegos de Mesa',
    nombre: 'Catan',
    descripcion: 'Clásico juego de estrategia para colonizar la isla de Catan (3-4 jugadores).',
    imagen: 'https://devirinvestments.s3.eu-west-1.amazonaws.com/img/catalog/product/8436017220100-1200-frontflat.jpg',
    precio: 29990,
  },
  {
    id: 'JM002',
    categoria: 'Juegos de Mesa',
    nombre: 'Carcassonne',
    descripcion: 'Coloca losetas y domina fortalezas medievales con tu estrategia.',
    imagen: 'https://www.geekz.cl/web/image/product.template/21455/image',
    precio: 24990,
  },
  {
    id: 'AC001',
    categoria: 'Accesorios',
    nombre: 'Control Xbox Series X',
    descripcion: 'Agarre texturizado y precisión inalámbrica para Xbox y PC.',
    imagen: 'https://i5.walmartimages.com/seo/Microsoft-Xbox-One-Bluetooth-Wireless-Controller-Black_b30e1557-556d-4638-a692-7b42cb425b52_1.3d21d0fb85ffc29ebc3435b2d1bd3d75.jpeg',
    precio: 59990,
  },
  {
    id: 'AC002',
    categoria: 'Accesorios',
    nombre: 'HyperX Cloud II',
    descripcion: 'Audio envolvente virtual 7.1 con máxima comodidad de espuma viscoelástica.',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdO6mRCcRglH7n3EMSCivY3XAlU0QezZArTzefhyhxrnk54EqblxI_yQCN&s=10',
    precio: 79990,
  },
  {
    id: 'CO001',
    categoria: 'Consolas',
    nombre: 'PlayStation 5',
    descripcion: 'Gráficos 4K con trazado de rayos y retroalimentación háptica inmersiva.',
    imagen: 'https://www.weplay.cl/pub/media/wysiwyg/PRODUCTOS/IMAGENES/PLAYSTATION/711719570820_2.jpg',
    precio: 549990,
  },
  {
    id: 'CG001',
    categoria: 'Computadores',
    nombre: 'PC ASUS ROG Strix',
    descripcion: 'Componentes de vanguardia para jugar sin límites competitivos.',
    imagen: 'https://rimage.ripley.cl/home.ripley/Attachment/WOP/1/2000408648833/full_image-2000408648833',
    precio: 1299990,
  },
  {
    id: 'SG001',
    categoria: 'Sillas Gamers',
    nombre: 'Secretlab Titan',
    descripcion: 'Ergonomía superior diseñada para sesiones intensas de juego.',
    imagen: 'https://m.media-amazon.com/images/I/41wKF+jkOAL._AC_.jpg',
    precio: 349990,
  },
  {
    id: 'MS001',
    categoria: 'Mouse',
    nombre: 'Logitech G502 HERO',
    descripcion: 'Sensor de alta precisión de 25.600 DPI con 11 botones personalizables.',
    imagen: 'https://http2.mlstatic.com/D_NQ_NP_913004-MLA99443804514_112025-O.webp',
    precio: 49990,
  },
];

function notifyChange() {
  window.dispatchEvent(new Event(PRODUCTS_EVENT));
}

function readProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  notifyChange();
}

export function getProductos() {
  const stored = readProducts();
  if (stored) return stored;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTOS_INICIALES));
  return PRODUCTOS_INICIALES.map((producto) => ({ ...producto }));
}

export function getProducto(id) {
  return getProductos().find((producto) => producto.id === id) ?? null;
}

export function getCategorias() {
  const categorias = new Set(getProductos().map((producto) => producto.categoria));
  return [...categorias].sort((a, b) => a.localeCompare(b, 'es'));
}

function generarId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `P${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function normalizarProducto(datos, idExistente = null) {
  const categoria = String(datos.categoria ?? '').trim();
  const nombre = String(datos.nombre ?? '').trim();
  const descripcion = String(datos.descripcion ?? '').trim();
  const imagen = String(datos.imagen ?? '').trim();
  const precio = Number(String(datos.precio ?? '').replace(/\./g, '').replace(',', '.'));

  if (!categoria) return { error: 'La categoría es obligatoria.' };
  if (!nombre) return { error: 'El nombre es obligatorio.' };
  if (!descripcion) return { error: 'La descripción es obligatoria.' };
  if (!/^https?:\/\/\S+$/i.test(imagen)) {
    return { error: 'La imagen debe ser un link válido que comience con http:// o https://.' };
  }
  if (!Number.isFinite(precio) || precio <= 0) {
    return { error: 'El valor debe ser un número mayor a 0.' };
  }

  return {
    producto: {
      id: idExistente ?? generarId(),
      categoria,
      nombre,
      descripcion,
      imagen,
      precio: Math.round(precio),
    },
  };
}

export function crearProducto(datos) {
  const resultado = normalizarProducto(datos);
  if (resultado.error) return { ok: false, error: resultado.error };

  const productos = getProductos();
  writeProducts([...productos, resultado.producto]);
  return { ok: true, producto: resultado.producto };
}

export function actualizarProducto(id, datos) {
  const productos = getProductos();
  const existente = productos.find((producto) => producto.id === id);
  if (!existente) return { ok: false, error: 'El producto ya no existe en el catálogo.' };

  const resultado = normalizarProducto(datos, id);
  if (resultado.error) return { ok: false, error: resultado.error };

  writeProducts(
    productos.map((producto) => (producto.id === id ? resultado.producto : producto)),
  );
  return { ok: true, producto: resultado.producto };
}

export function eliminarProducto(id) {
  const productos = getProductos();
  const restantes = productos.filter((producto) => producto.id !== id);
  if (restantes.length === productos.length) {
    return { ok: false, error: 'El producto ya no existe en el catálogo.' };
  }
  writeProducts(restantes);
  return { ok: true };
}

export function subscribeProductos(callback) {
  window.addEventListener(PRODUCTS_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(PRODUCTS_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(valor ?? 0);
}
