import { Navigate, Route, Routes } from 'react-router';

import Header from './Components/Header';
import Footer from './Components/Footer';
import RutaProtegida from './Components/RutaProtegida';
import Carrito from './Pages/carrito';
import Inicio from './Pages/inicio';
import Login from './Pages/login';
import Registro from './Pages/registro';
import AdminUsuarios from './Pages/AdminUsuarios';

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Inicio" element={<Inicio />} />
        <Route path="/Carrito" element={<Carrito />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Registro" element={<Registro />} />
        {/* Ruta protegida: solo usuarios con rol ADMIN */}
        <Route
          path="/Admin/Usuarios"
          element={
            <RutaProtegida rol="ADMIN">
              <AdminUsuarios />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/Inicio" replace />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
