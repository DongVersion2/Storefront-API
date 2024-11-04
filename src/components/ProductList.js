import React, { useState , useEffect} from "react";
import { shopifyFetch} from "../utils/shopify";
import { PRODUCTS_QUERY } from "../graphql/queries";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

//lấy dữ liệu sản phẩm từ shopify api
const ProductList = () => {
    //khởi tạo state để lưu trữ dữ liệu sản phẩm
    const [products, setProducts] = useState([]);
    const { addToCart, cartItems } = useCart();
    const [loading, setLoading] = useState(false);

    //sử dụng useEffect để gọi hàm fetchProducts khi component được render
    // useEffect chỉ chạy 1 lần khi component được render
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            //gọi api shopify với query graphql
            const { data} = await shopifyFetch({query: PRODUCTS_QUERY});
            // format dữ liệu sản phẩm từ response
            const formattedProducts = data.products.edges.map(({ node }) => ({
                id: node.id,
                title: node.title,
                description: node.description,
                image: node.images.edges[0]?.node.url,
                variants: node.variants.edges.map(({ node: variant }) => ({
                    id: variant.id,
                    priceV2: variant.priceV2
                }))
            }));
            setProducts(formattedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            // setLoading(false);
        }
    }
    // render component
    return (
        <div>
            <h1>List Products</h1>
            <div className="products-grid">
            {products.map((product) => (
                <div className="product-item" key={product.id}>
                    { product.image && <img src={product.image} alt={product.title} /> }
                    <h2>{product.title}</h2>
                    <p>{product.description}</p>
                    <p>Price: {product.variants[0].priceV2.amount} {product.variants[0].priceV2.currencyCode}</p>
                    <button className="add-to-cart-button" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                </div>
            ))}
            </div>
            <div className="go-to-cart">
                <Link to="/cart">
                <button>Go to Cart ({cartItems.length}) </button>
                </Link>
            </div>
        </div>
    );

    function handleAddToCart(product) {
        // console.log(product);
        const productTToAdd = {
            id: product.id,
            title: product.title,
            price: product.variants[0].priceV2.amount,
            image: product.image,
            variants: product.variants
        };
        addToCart(productTToAdd);
    }
}

export default ProductList;