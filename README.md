# Level-Up Gamer (React) 🎮🕹️

Bienvenido a la versión modernizada de **Level-Up Gamer**, una plataforma web de comercio electrónico orientada a la venta de videojuegos, consolas y periféricos gaming. 

Este proyecto representa la **migración y evolución desde una arquitectura web tradicional en HTML5/CSS/JavaScript estático hacia una Single Page Application (SPA) modular construida con React**.

---

## 👨‍💻 Autor y Desarrollador
* **Desarrollador:** Luis Torres
* **Perfil:** Estudiante de Ingeniería en Informática en **Duoc UC**

---

## 📌 Contexto del Proyecto y Objetivos de la Migración

El proyecto original estaba desarrollado con estructura de páginas HTML tradicionales enlazadas mediante navegación estándar. El objetivo principal de la migración fue mejorar la mantenibilidad, escalabilidad, rendimiento y experiencia de usuario (UX/UI), aprovechando el ecosistema de componentes de **React**.

### 🔄 Principales cambios implementados en la migración:
1. **Arquitectura basada en Componentes:** Desacoplamiento de vistas estáticas en componentes reutilizables (Navbar, Footer, Tarjetas de Productos, Carrito de Compras, etc.).
2. **Enrutamiento del lado del cliente (SPA):** Navegación fluida y rápida sin recargas completas de la página al cambiar de vista.
3. **Manejo reactivo de estado:** Gestión del catálogo de productos, filtros por categoría y flujo del carrito de compras mediante hooks de estado de React (`useState`, `useEffect`).
4. **Optimización de Estilos y Recursos:** Adaptación de las hojas de estilo y assets visuales a la estructura modular de la aplicación.
5. **Control de Versiones y Limpieza:** Reorganización del repositorio bajo el control de versiones con Git.

---

## 🚀 Tecnologías Utilizadas

* **React:** Biblioteca principal para la construcción de interfaces de usuario interactivas y modulares.
* **JavaScript (ES6+):** Lógica del cliente, manipulación reactiva de datos y gestión del flujo del carrito de compras.
* **HTML5 & CSS3:** Estructura semántica moderna y diseño adaptable (*responsive design*).
* **Git & GitHub:** Control de versiones, historial de desarrollo y despliegue del repositorio.

---

## 📂 Estructura General del Proyecto

```text
Level-Up-Gamer_React/
├── public/                 # Archivos públicos estáticos y template HTML base
├── src/
│   ├── assets/             # Imágenes, iconos y recursos multimedia
│   ├── components/         # Componentes reutilizables (Navbar, Cards, Modales, etc.)
│   ├── pages/              # Vistas principales (Inicio, Catálogo, Detalle, Carrito, etc.)
│   ├── App.jsx             # Componente raíz y definición de rutas
│   ├── main.jsx / index.js # Punto de entrada de la aplicación
│   └── index.css           # Estilos globales y utilidades
├── package.json            # Dependencias y scripts del proyecto
└── README.md               # Documentación general del proyecto
```

---

## ⚙️ Instalación y Puesta en Marcha

Para clonar y ejecutar este proyecto en tu entorno local, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/<tu-usuario>/Level-Up-Gamer_React.git
   cd Level-Up-Gamer_React
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm start
   # o bien, si estás utilizando Vite:
   # npm run dev
   ```

4. **Abrir en el navegador:**
   Visita `http://localhost:3000` (o `http://localhost:5173` si usas Vite) para interactuar con la aplicación.

---

## 📈 Próximas Mejoras (Roadmap)

- [ ] Conexión a una API REST backend para la persistencia de usuarios y órdenes de compra.
- [ ] Implementación de autenticación de clientes y panel de administración para gestión de inventario.

---
*Desarrollado  por **Luis Torres** – Estudiante de Ingeniería en Informática, Duoc UC.*



Comandos importantes

Instalación/Ejecucion
1- npm install
2- npm run dev
3- npm run build

Pruebas Unitarias 
1- npm run test -- --run
2- npm run test:coverage
