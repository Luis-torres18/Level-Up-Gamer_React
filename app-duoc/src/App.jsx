import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './Components/Nav';
import Footer from './Components/Footer';

// Páginas
import Inicio from './Pages/inicio';
import Carrito from './Pages/carrito';
import Login from './Pages/login';
import Registro from './Pages/registro';

function App() {
  const [cartItems, setCartItems] = useState([]);

  // Contador total de productos en el carrito
  const cartCount = cartItems.reduce((acc, item) => acc + (item.cantidad || 1), 0);

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: (item.cantidad || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => setCartItems([]);

  return (
    <BrowserRouter>
      {/* Barra de navegación visible en todas las vistas */}
      <Nav cartCount={cartCount} />

      {/* Rutas de las páginas */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Inicio onAddToCart={handleAddToCart} />} />
          <Route path="/productos" element={<Inicio onAddToCart={handleAddToCart} />} />
          <Route 
            path="/carrito" 
            element={
              <Carrito 
                items={cartItems} 
                onRemoveItem={handleRemoveFromCart} 
                onClearCart={handleClearCart} 
              />
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </main>

      {/* Pie de página visible en todas las vistas */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;