import React from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import './App.css';

const App = () => {
  return (
    <div className="app">
      <header>
        <h1>Shopify Store</h1>
      </header>
      <main>
        <ProductList />
        <Cart />
      </main>
    </div>
  );
};

export default App;
