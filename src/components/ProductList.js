import React, { useEffect, useState } from 'react';
import client from '../shopifyClient';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    client.product.fetchAll().then((products) => {
      console.log('Fetched products:', products);
      setProducts(products);
    }).catch(error => {
      console.error('Error fetching products:', error);
    });
  }, []);

  const formatPrice = (variant) => {
    if (!variant) return 'Price not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: variant.priceV2?.currencyCode || 'USD'
    }).format(variant.priceV2?.amount || 0);
  };

  return (
    <div>
      <h1>Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h2>{product.title}</h2>
            {product.images[0] && (
              <img 
                src={product.images[0].src} 
                alt={product.title}
                style={{maxWidth: '200px'}} 
              />
            )}
            <p>{product.description}</p>
            <p>Price: {formatPrice(product.variants[0])}</p>
            <button onClick={() => console.log(product.variants[0])}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList; 