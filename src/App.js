import React from 'react';
import ProductList from './components/ProductList';
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
import Cart from './components/Cart';
import { CartProvider } from './contexts/CartContext';
import './App.css';
import './styles/home.css';
import './styles/cart.css';
const App = () => {
  return (
    // wrapper cho phép routing trong app
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
