import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/Authentication/AuthProvider";
import { CartProvider } from "./contexts/Cart/CartContext";
import { WishlistProvider } from "./contexts/Wishlist/WishlistContext";
import { OrderProvider } from "./contexts/Order/OrderContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        {/* อยู่ใต้ AuthProvider เพื่อโหลดออเดอร์ของผู้ใช้ และให้ทุกหน้าสั่ง refreshOrders ได้ */}
        <OrderProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
