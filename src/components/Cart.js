import React, { useState } from 'react';
import client from '../shopifyClient';

const Cart = () => {
  const [checkout, setCheckout] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const createCheckout = async () => {
    try {
      const newCheckout = await client.checkout.create();
      console.log('Created checkout:', newCheckout);
      setCheckout(newCheckout);
    } catch (error) {
      console.error('Error creating checkout:', error);
    }
  };

  const addItemToCheckout = async (variantId, quantity) => {
    if (!checkout) {
      await createCheckout();
    }

    const lineItemsToAdd = [{
      variantId,
      quantity,
    }];

    try {
      const updatedCheckout = await client.checkout.addLineItems(
        checkout.id,
        lineItemsToAdd
      );
      setCheckout(updatedCheckout);
      setCartItems([...cartItems, { variantId, quantity }]);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  return (
    <div>
      <h2>Shopping Cart</h2>
      <button onClick={createCheckout}>Initialize Cart</button>
      
      {checkout && (
        <div>
          <h3>Cart Items: {cartItems.length}</h3>
          <button onClick={() => addItemToCheckout('sample-variant-id', 1)}>
            Add Sample Item
          </button>
          {cartItems.length > 0 && (
            <a href={checkout.webUrl} target="_blank" rel="noopener noreferrer">
              Proceed to Checkout
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart; 