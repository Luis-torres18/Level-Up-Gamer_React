# Level-Up Gamer — Frontend (React + Vite)

Single Page Application de la tienda **Level-Up Gamer**. Consume los 3 microservicios Spring Boot del backend con **axios** y se publica como sitio estático en **AWS S3**.

## Tecnologías

- React 19 + React Router
- axios (cliente HTTP con interceptores para el token JWT)
- Vite (desarrollo y build)
- Vitest + Testing Library (pruebas unitarias y cobertura)

## Conexión con el backend

| Servicio | Variable | Local | Qué usa el front |
|---|---|---|---|
| ms-productos | `VITE_API_PRODUCTOS_URL` | `http://localhost:8081` | `GET / POST / PUT / DELETE /api/productos` |
| ms-usuarios | `VITE_API_USUARIOS_URL` | `http://localhost:8082` | `POST /api/auth/registro`, `POST /api/auth/login` |
| ms-gestion-usuarios | `VITE_API_GESTION_URL` | `http://localhost:8083` | `GET / POST / PUT / DELETE /api/usuarios` |

Archivos principales:

- `src/services/api.js`: crea un cliente axios por microservicio. Un interceptor agrega `Authorization: Bearer <token>` y, si la API responde 401, cierra la sesión.
- `src/services/sesion.js`: guarda el token y los datos del usuario en `localStorage`.
- `src/services/auth.js`: registro, login, logout y roles (`ADMIN` / `CLIENTE`).
- `src/services/productos.js`: CRUD de productos contra la API (ya no hay productos escritos en el código).
- `src/services/usuarios.js`: CRUD de usuarios para el administrador.
- `src/Components/RutaProtegida.jsx`: exige sesión y, si se indica, un rol.
- `src/Pages/AdminUsuarios.jsx`: pantalla de **Administración** (gestión de usuarios).

## Roles en la página

| | Sin sesión | CLIENTE | ADMIN |
|---|---|---|---|
| Ver catálogo y usar el carrito | ✓ | ✓ | ✓ |
| Descuento 20% (correo @duoc.cl / @duocuc.cl) | | ✓ | ✓ |
| Crear, editar y eliminar productos (Inicio → Panel de administración) | | | ✓ |
| Botón **Administración** → `/Admin/Usuarios`: ver, crear, editar (incluido el rol) y eliminar usuarios | | | ✓ |

La ruta `/Admin/Usuarios` está protegida: sin sesión lleva al Login (y vuelve después de ingresar), y con rol CLIENTE muestra "Acceso denegado". Además, el backend rechaza con 401/403 cualquier llamada sin permisos.

## Ejecutar en local

Primero levanta el backend (`docker compose up -d --build` en la carpeta `levelup-backend`). Luego:

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>. Para entrar como administrador usa `admin@duocuc.cl` / `Admin123!` (lo crea el script de la base de datos).

## Pruebas y cobertura

```bash
npm test                 # modo observador
npm run test:coverage    # una pasada + informe de cobertura
```

El informe HTML queda en `coverage/index.html`. Las pruebas no necesitan el backend: `tests/helpers/fakeApi.js` reemplaza el adaptador de axios por un backend en memoria con las mismas reglas que los microservicios (roles, 401, 403, 404 y 409), así se prueban los servicios, los interceptores y las pantallas tal como funcionan con la API real.

## Publicar en AWS S3

1. Copia `.env.example` como `.env.production` y reemplaza `<ELASTIC_IP>` por la IP elástica de la EC2.
2. `npm run build`: genera `dist/`.
3. Crea un bucket, activa **Static website hosting** con `index.html` como documento de índice y de error, quita el bloqueo de acceso público y agrega la política de lectura pública.
4. Sube el **contenido** de `dist/` (o usa `aws s3 sync dist/ s3://<tu-bucket> --delete`).
5. Agrega la URL del bucket a `CORS_ORIGINS` en el `.env` del backend.

El paso a paso completo (EC2 + S3) está en el README del backend.

> `vite.config.js` usa `base: "/"` para que las rutas anidadas como `/Admin/Usuarios` carguen bien en S3 al recargar la página.
