import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';

import { getSession, subscribe } from '../services/auth';

// Protege una ruta: exige sesión iniciada y, opcionalmente, un rol (ej: rol="ADMIN").
function RutaProtegida({ children, rol }) {
  const location = useLocation();
  const [usuario, setUsuario] = useState(getSession);

  useEffect(() => subscribe(() => setUsuario(getSession())), []);

  if (!usuario) {
    return (
      <Navigate
        to="/Login"
        replace
        state={{
          desde: location.pathname,
          aviso: 'Debes iniciar sesión para acceder a esa página.',
        }}
      />
    );
  }

  if (rol && usuario.rol !== rol) {
    return (
      <main className="form-page-main">
        <section className="form-wrapper acceso-denegado">
          <div className="form-header">
            <h1>ACCESO DENEGADO</h1>
            <p>Esta sección es solo para administradores.</p>
          </div>
          <Link to="/Inicio" className="btn-submit">
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  return children;
}

export default RutaProtegida;
