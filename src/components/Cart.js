import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        createCheckout,
        isCheckingOut
    } = useCart();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('checkout_completed')) {
            navigate('/', { replace: true });
            window.location.reload();
        }
    }, [location, navigate]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    };

    //xử lí checkout
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        try {
            localStorage.setItem('returnToUrl', window.location.pathname);
            await createCheckout();
        } catch (error) {
            console.error('Lỗi khi tạo checkout:', error);
            alert('Có lỗi xảy ra khi tạo checkout. Vui lòng thử lại!');
        }
    }

  //render UI
  return (
    <div className='cart-container'>
      <div className='cart-header'>
        <h1>Your cart</h1>
        <Link to="/">
          Continue shopping
        </Link>
      </div>

      <div className='cart-header-divider'>
        <div className='cart-header-divider-content'>
          <div>PRODUCT</div>
          <div style={{ textAlign: 'center' }}>QUANTITY</div>
          <div style={{ textAlign: 'right' }}>TOTAL</div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        // Thêm thông báo khi giỏ hàng trống
        <div className='cart-empty'>
          <p>Giỏ hàng của bạn đang trống</p>
          <Link to="/">
            <button className='continue-shopping-button'>Tiếp tục mua sắm</button>
          </Link>
        </div>
      ) : (
        // Hiển thị sản phẩm khi có trong giỏ
        <>
          {cartItems.map((item) => (
            <div className='cart-item' key={item.id}>
              <div className='cart-item-content'>
                <img src={item.image} alt={item.title}/>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.price}₫</p>
                </div>
              </div>

              <div className='cart-item-quantity'>
                <button 
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  disabled={isCheckingOut}
                >−</button>
                <input 
                  className='cart-item-quantity-input'
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  disabled={isCheckingOut}
                  min="1"
                />
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isCheckingOut}
                >+</button>
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  style={{ marginLeft: '10px' }}
                  disabled={isCheckingOut}
                >🗑</button>
              </div>

              <div className='cart-item-total'>
                {(parseFloat(item.price) * item.quantity).toFixed(3)}₫
              </div>
            </div>
          ))}

          <div className='cart-total'>
            <div className='cart-total-content'>
              <span>Estimated total: </span>
              <strong>{calculateTotal().toFixed(3)} VND</strong>
            </div>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '20px' }}>
              Taxes, discounts and shipping calculated at checkout.
            </p>
            <button 
              className='cart-total-button'
              onClick={handleCheckout}
              disabled={isCheckingOut || cartItems.length === 0}
            >
              {isCheckingOut ? 'Đang xử lý...' : 'Thanh toán'}
            </button>

            {isCheckingOut && (
              <div className="loading-message">
                Đang tạo đơn hàng, vui lòng đợi...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;