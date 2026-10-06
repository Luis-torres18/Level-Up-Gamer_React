import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Inicio from './Pages/inicio.jsx'
import Carrito from './Pages/carrito.jsx'
import Login from './Pages/login.jsx'
import Registro from './Pages/registro.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Inicio />
  </StrictMode>,
)
