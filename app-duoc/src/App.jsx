import Header from './Components/Header';
import Footer from './Components/Footer';
import { Route, Routes } from 'react-router'
import Carrito from './Pages/carrito';
import Inicio from './Pages/Inicio'
import Login from './Pages/login';
import Registro from './Pages/registro';

function App() {
  return (
    <>
    <Header></Header>

    <Routes>
      <Route path="/" element={<Inicio></Inicio>}></Route>
      <Route path="/Inicio" element={<Inicio></Inicio>}></Route>
      <Route path="/Carrito" element={<Carrito></Carrito>}></Route>
      <Route path="/Login" element={<Login></Login>}></Route>
      <Route path="/Registro" element={<Registro></Registro>}></Route>
    </Routes>

    <Footer></Footer>
    </>
  )
}

export default App;