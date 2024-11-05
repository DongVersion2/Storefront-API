import React, { useState , useEffect} from "react";
import { shopifyFetch} from "../utils/shopify";
import { PRODUCTS_QUERY } from "../graphql/queries";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

//lấy dữ liệu sản phẩm từ shopify api
const ProductList = () => {
    //khởi tạo state để lưu trữ dữ liệu sản phẩm
    const [products, setProducts] = useState([]);//lưu danh sách sản phẩm
    const { addToCart, cartItems } = useCart();//lấy hàm addToCart và cartItems từ CartContext
    const [loading, setLoading] = useState(false);//quản lý trạng thái loading

    //sử dụng useEffect để gọi hàm fetchProducts khi component được render
    // useEffect chỉ chạy 1 lần khi component được render(mount)
    useEffect(() => {
        fetchProducts();
    }, []); // [] nghĩa là chỉ chạy 1 lần

    const fetchProducts = async () => {
        try {
           // Gọi API Shopify thông qua shopifyFetch utility
            const { data} = await shopifyFetch({
                query: PRODUCTS_QUERY// GraphQL query để lấy sản phẩm
            });
            console.log('Datassss:', data);
            // format dữ liệu sản phẩm từ response API
            const formattedProducts = data.products.edges.map(({ node }) => ({
                id: node.id,
                title: node.title,
                description: node.description,
                image: node.images.edges[0]?.node.url,
                variants: {
                    edges: node.variants.edges.map(({ node: variant }) => ({
                        node: {
                            id: variant.id,
                            priceV2: variant.priceV2
                        }
                    }))
                }
            }));
            // Cập nhật state với dữ liệu đã format
            setProducts(formattedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
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
                    <p>Price: {product.variants.edges[0].node.priceV2.amount} {product.variants.edges[0].node.priceV2.currencyCode}</p>
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
        console.log('Handling add to cart:', product);
        try {
            const productToAdd = {
                id: product.id,
                title: product.title,
                variants: {
                    edges: product.variants.edges
                },
                images: {
                    edges: [{
                        node: {
                            url: product.image
                        }
                    }]
                }
            };
            console.log('Formatted product to add:', productToAdd);
            addToCart(productToAdd);
        } catch (error) {
            console.error('Error in handleAddToCart:', error);
        }
    }
}

export default ProductList;


//async là một từ khóa trong JavaScript để khai báo một hàm bất đồng bộ (asynchronous function).
//Khi một hàm được khai báo với async, nó có thể chạy đồng thời với các hàm khác mà không cần phải đợi chúng hoàn thành.
//Điều này rất hữu ích khi cần thực hiện các tác vụ mạng, đọc/ghi file, hoặc thực hiện các hoạt động khác mà có thể dừng việc thực thi hàm đó.
//Khi một hàm được khai báo với async, nó sẽ trả về một Promise.
//Promise là một đối tượng trong JavaScript đại diện cho một giá trị có thể sẽ được trả về sau hoặc không trả về sau.
//Khi một hàm async hoàn thành, nó sẽ trả về một giá trị hoặc ném một lỗi.
//Điều này cho phép sử dụng các hàm async trong các biểu thức await, giúp việc xử lý các hoạt động không đồng bộ trở nên dễ dàng hơn.
