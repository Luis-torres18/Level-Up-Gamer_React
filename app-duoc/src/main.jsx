import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import inicio from './Pages/inicio.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <inicio />
  </StrictMode>,
)
