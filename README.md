1. User click "Add to Cart"
   ↓
2. Sản phẩm được thêm vào state cartItems
   ↓
3. cartItems được lưu vào localStorage
   ↓
4. User xem giỏ hàng và click "Checkout"
   ↓
5. Format dữ liệu giỏ hàng cho Shopify
   ↓
6. Gọi API tạo checkout
   ↓
7. Nhận URL checkout từ Shopify
   ↓
8. Clear giỏ hàng local
   ↓
9. Chuyển hướng đến trang checkout Shopify



1. Khởi tạo và Hiển thị Sản phẩm:
- Component ProductList fetch dữ liệu sản phẩm từ Shopify API
- Hiển thị danh sách sản phẩm với thông tin và nút "Add to Cart"
2. Quản lý Giỏ hàng:
- CartContext quản lý state giỏ hàng cho toàn bộ ứng dụng
- Lưu trữ giỏ hàng trong localStorage để giữ dữ liệu khi refresh trang
- Cung cấp các functions: thêm, xóa, cập nhật số lượng sản phẩm
3. Quy trình Mua hàng:
- Người dùng thêm sản phẩm vào giỏ
- Xem giỏ hàng và điều chỉnh số lượng
- Bấm thanh toán để tạo checkout session với Shopify 
- Chuyển hướng đến trang thanh toán của Shopify
4. Xử lý API và Data Flow:
- shopifyFetch xử lý mọi request đến Shopify API
- GraphQL queries/mutations để tương tác với Shopify
- Dữ liệu được format phù hợp giữa frontend và API
