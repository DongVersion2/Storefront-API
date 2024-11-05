import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopifyFetch } from '../utils/shopify';
import { CREATE_CHECKOUT_MUTATION } from '../graphql/mutations';

//tạo 1 context mới
const CartContext = createContext();

export function CartProvider({ children }) {
    //khởi tạo state để lưu giỏ hàng, lấy dữ liệu từ local storage nếu có
    const [cartItems, setCartItems] = useState(() => {
                // Kiểm tra checkout_completed ngay khi khởi tạo state
                const checkoutCompleted = localStorage.getItem('checkout_completed');
                if (checkoutCompleted) {
                    localStorage.removeItem('checkout_completed');
                    localStorage.removeItem('cart');
                    return [];
                }
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    //thêm loading state
    const [isCheckingOut, setCheckingOut] = useState(false);
    // useEffect sẽ chạy mỗi khi cartItems thay đổi
    useEffect(() => {
        //kiểm tra url để xem người dùng có vừa quay lại từ checkout không
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('checkout_completed')) {
            //nếu có thì xóa giỏ hàng và set lại cartItems
            localStorage.removeItem('cart');
            localStorage.removeItem('checkout_completed');
            setCartItems([]);
            return;
        }

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

        try {
            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.id === product.id);
                if (existingItem) {
                    return prevItems.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }

                const variant = product.variants.edges[0].node;
                const variantId = variant.id;

                const newItem = {
                    id: product.id,
                    variantId: variantId,
                    title: product.title,
                    price: variant.priceV2.amount,
                    image: product.images?.edges[0]?.node.url,
                    quantity: quantity
                };

                console.log('Adding new item:', newItem);
                return [...prevItems, newItem];
            });
            alert('Đã thêm sản phẩm vào giỏ hàng!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
        }
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

            if (!cartItems || cartItems.length === 0) {
                throw new Error('Giỏ hàng trống');
            }

            //chuyển đổi giỏ hàng sang format shopify cần
            // console.log('Cart Items before checkout:', cartItems);
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

            // nếu như muốn thanh toán xong mất giỏ hàng thì mở đây
            // localStorage.setItem('checkout_completed', 'true');
            // setCartItems([]);
            // localStorage.removeItem('cart');
            // // Thêm parameter vào URL checkout
            // const checkoutUrlWithParam = `${checkoutUrl}${checkoutUrl.includes('?') ? '&' : '?'}return_to=${window.location.origin}?checkout_completed=true`;
            // window.location.href = checkoutUrlWithParam;


            // Chuyển hướng tới trang checkout
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
// Hook useCart giúp các component dễ dàng