import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopifyFetch } from '../utils/shopify';
import { CREATE_CHECKOUT_MUTATION } from '../graphql/mutations';

//tạo 1 context mới
const CartContext = createContext();

export function CartProvider({ children }) {
    //khởi tạo state để lưu giỏ hàng, lấy dữ liệu từ local storage nếu có
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    //thêm loading state
    const [isCheckingOut, setCheckingOut] = useState(false);
    // useEffect sẽ chạy mỗi khi cartItems thay đổi
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);
    //hàm thêm sản phẩm vào giỏ hàng
    const addToCart = (product, quantity = 1) => {
        console.log('Adding product:', product);

        if (!product || !product.variants || !product.variants.edges || !product.variants.edges[0]) {
            console.error('Invalid product structure:', product);
            alert('Không thể thêm sản phẩm này vào giỏ hàng');
            return;
        }

        setCartItems(prevItems => {
            //kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
            const existingItem = prevItems.find(item => item.id === product.id);
            //nếu tồn tại thì cập nhật số lượng
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            const variant = product.variants.edges[0].node;
            const variantId = variant.id;

            console.log('Selected variant:', variant);
            console.log('Variant ID:', variantId);

            return [...prevItems, {
                id: product.id,
                variantId: variantId,
                title: product.title,
                price: variant.priceV2.amount,
                image: product.images?.edges[0]?.node.url,
                quantity: quantity
            }];
        });
        alert('Đã thêm sản phẩm vào giỏ hàng!');
    };
    //hàm xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };
    //hàm cập nhật số lượng sản phẩm trong giỏ hàng
    const updateQuantity = (productId, quantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId
                    ? { ...item, quantity: quantity }
                    : item
            )
        );
    };
    //checkout
    const createCheckout = async () => {
        try {
            //bật loading
            setCheckingOut(true);

            // Kiểm tra cartItems có tồn tại không
        if (!cartItems || cartItems.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

            //chuyển đổi giỏ hàng sang format shopify cần
            console.log('Cart Items before checkout:', cartItems);
            const lineItems = cartItems.map(item => {

                if (!item || !item.variantId) {
                    console.error('Invalid item:', item);
                    throw new Error('Sản phẩm không hợp lệ trong giỏ hàng');
                }

                // Encode variantId to Base64
                const encodedVariantId = btoa(item.variantId);
                console.log('Original variantId:', item.variantId);
                console.log('Encoded variantId:', encodedVariantId);

                return {
                    variantId: encodedVariantId,
                    quantity: parseInt(item.quantity)
                };
            });

            console.log('Line Items for checkout:', lineItems);

            const checkoutInput = {
                input: {
                    lineItems: lineItems,
                    allowPartialAddresses: true
                }
            };

            console.log('Checkout input:', checkoutInput);

            const { data } = await shopifyFetch({
                query: CREATE_CHECKOUT_MUTATION,
                variables: checkoutInput
            });

            console.log('Checkout response:', data);

            if (!data || !data.checkoutCreate) {
                throw new Error('Invalid response from Shopify');
            }

            if (data.checkoutCreate.checkoutUserErrors?.length > 0) {
                const error = data.checkoutCreate.checkoutUserErrors[0];
                console.error('Checkout user error:', error);
                throw new Error(error.message);
            }

            const checkoutUrl = data.checkoutCreate.checkout.webUrl;
            if (!checkoutUrl) {
                throw new Error('No checkout URL received');
            }

            setCartItems([]);
            localStorage.removeItem('cart');
           //chuyển hướng đến trang checkout của shopify
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Detailed checkout error:', error);
            alert(`Lỗi khi tạo checkout: ${error.message}`);
        } finally {
            setCheckingOut(false);
        }
    };
    // Provider cung cấp các giá trị và hàm cho các component con
    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            createCheckout,
            isCheckingOut
        }}>
            {children}
        </CartContext.Provider>
    );
}
// Hook để các component dễ dàng sử dụng context
export function useCart() {
    return useContext(CartContext);
}

// Context giúp share state giữa các component mà không cần prop drilling
// useState quản lý dữ liệu giỏ hàng
// useEffect đồng bộ giỏ hàng với localStorage
// Các hàm xử lý giỏ hàng (thêm, xóa, cập nhật)
// Hook useCart giúp các component dễ dàn