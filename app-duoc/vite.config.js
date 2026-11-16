import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // "/" para publicar en la raíz del bucket S3. Con "./" las rutas anidadas
  // (ej: /Admin/Usuarios) no encontrarían los archivos JS/CSS al recargar la página.
  base: "/",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx"],
    },
  },
});
