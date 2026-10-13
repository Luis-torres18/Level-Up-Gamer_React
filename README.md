# 🎮 Level-Up Gamer — E-Commerce Web Application (React Migration)

Plataforma web de comercio electrónico orientada al mundo gamer (videojuegos, consolas, componentes y accesorios). 

Este repositorio documenta la **modernización y migración arquitectónica** de un sitio web estático tradicional (HTML5, CSS3 y Vanilla JavaScript) hacia una **Single Page Application (SPA) modular desarrollada con React**, optimizando la reutilización de componentes, la reactividad del estado y la experiencia de usuario.

---

## 👨‍💻 Autor y Desarrollador

* **Luis Torres**  
  *Estudiante de Ingeniería en Informática — Duoc UC*

---

## 📌 Contexto de la Migración

El proyecto inicial consistía en múltiples páginas HTML estáticas con estilos globales y scripts tradicionales que manipulaban directamente el Document Object Model (DOM). Para elevar la escalabilidad del sistema y adoptar estándares modernos de la industria, se rediseñó bajo el ecosistema de **React**:

| Criterio | Versión Original (HTML / CSS / JS) | Versión Migrada (React) |
| :--- | :--- | :--- |
| **Arquitectura** | Multipage (archivos `.html` independientes) | Single Page Application (SPA) desacoplada y modular |
| **Manipulación de interfaz** | Mutaciones manuales con `document.querySelector` | Renderizado declarativo con Virtual DOM y JSX |
| **Gestión de estado** | Variables globales en archivos `.js` dispersos | Estado reactivo con React Hooks (`useState`, `useEffect`) |
| **Reutilización de interfaz** | Código HTML duplicado en cabeceras y tarjetas | Componentes reutilizables (`Navbar`, `ProductCard`, `Footer`, etc.) |
| **Navegación** | Recarga completa del navegador por página | Navegación fluida del lado del cliente (Client-Side Routing) |

---

## 🚀 Funcionalidades Principales

* **Catálogo Dinámico de Productos:** Renderizado reactivo de consolas, accesorios, periféricos y juegos.
* **Carrito de Compras:** Manejo de estado para añadir/remover artículos y cálculo reactivo de subtotales y totales.
* **Diseño Responsivo:** Adaptabilidad para pantallas de escritorio, tablets y smartphones.
* **Formularios Controlados:** Formularios de contacto y registro adaptados al ciclo de vida de React con validación de entradas.
* **Estructura Escalable:** Separación de componentes reutilizables, páginas principales y recursos multimedia.

---

## 🛠️ Tecnologías y Herramientas

* **Frontend:** [React](https://react.dev/)
* **Lenguajes:** JavaScript (ES6+), JSX, HTML5 Semántico, CSS3
* **Entorno de ejecución y paquetes:** [Node.js](https://nodejs.org/) & npm
* **Control de versiones:** Git & GitHub

---

## 📂 Estructura del Repositorio

```text
Level-Up-Gamer_React/
├── public/                 # Archivos públicos estáticos e index.html
├── src/
│   ├── assets/             # Imágenes, logos, banners e iconos
│   ├── components/         # Componentes reutilizables de UI
│   │   ├── Navbar/         # Barra de navegación principal
│   │   ├── Footer/         # Pie de página informativo
│   │   ├── Cart/           # Módulo interactivo del carrito
│   │   └── ProductCard/    # Tarjeta individual de producto
│   ├── pages/              # Vistas principales de la aplicación
│   │   ├── Home/           # Portada y productos destacados
│   │   ├── Catalog/        # Catálogo general con filtros
│   │   └── Contact/        # Formulario de soporte y contacto
│   ├── App.jsx             # Componente raíz de la aplicación
│   ├── main.jsx (o index.js)# Punto de entrada de renderizado React
│   └── index.css           # Estilos globales y normalización visual
├── package.json            # Dependencias y scripts de ejecución
└── README.md               # Documentación general del proyecto
```

---

## 💻 Instalación y Ejecución Local

Para clonar y poner en marcha el proyecto localmente, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU-USUARIO/Level-Up-Gamer_React.git
cd Level-Up-Gamer_React
```

### 2. Instalar dependencias
Comprueba tener instalado [Node.js](https://nodejs.org/) (versión 16.x o superior).
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
Si el proyecto fue creado con Vite:
```bash
npm run dev
```
*(Si usas Create React App, ejecuta `npm start`)*

Luego abre la dirección local indicada en la terminal (comúnmente `http://localhost:5173` o `http://localhost:3000`).

### 4. Generar la compilación para producción
```bash
npm run build
```

---

## 🔄 Desafíos Técnicos Resueltos

1. **Transformación de Marcado a JSX:** Corrección de atributos HTML (`class` a `className`, etiquetas autocontenidas como `<img />` e `<input />`).
2. **Refactorización de Lógica Vanilla:** Eliminación de eventos de escucha manuales (`addEventListener`) en favor de manejadores declarativos (`onClick`, `onChange`, `onSubmit`).
3. **Persistencia y Reactividad:** Migración de datos temporales hacia estados de React y almacenamiento local (`localStorage`) para preservar la sesión del usuario y el carrito.

---

## 📄 Licencia y Propósito

Proyecto académico y de portafolio profesional desarrollado para demostrar habilidades de desarrollo frontend moderno y migración de código legado.

Comandos importantes

Instalación/Ejecucion
1- npm install
2- npm run dev
3- npm run build

Pruebas Unitarias 
1- npm run test -- --run
2- npm run test:coverage
