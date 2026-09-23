import CartPage from "./pages/ShoppingCart/CartPage";
import Register from "./pages/Register/Register";
import Homepage from "./pages/Homepage/Homepage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "#components/Layout";
import ProductPage from "./pages/ProductPage/ProductPage";
import PersonalInfo from "./pages/User/01MyAccount/PersonalInfo";
import Addresses from "./pages/User/01MyAccount/Addresses";
import MyPurchase from "./pages/User/02MyPurchase/MyPurchase";
import OrderStatus from "./pages/User/02MyPurchase/OrderStatus";
import MyReviews from "./pages/User/03MyReviews/MyReviews";
import MyCancellations from "./pages/User/04MyCancellations/MyCancellations";
import MyWishlist from "./pages/User/05MyWishlist/MyWishlist";
import ProductListPage from "./pages/ProductPage/ProductListPage";
import LayoutAdmin from "#components/Admin/LayoutAdmin";
import AdminDashboard from "#components/Admin/AdminDashboard";
import AdminSandbox from "#components/Admin/AdminSandbox";
import UserManager from "#components/Admin/UserManager";
import Login from "./pages/Login/Login";
import SalePage from "./pages/ProductPage/SalePage";
import { TruckElectric } from "lucide-react";
import PromotionPage from "./pages/Admin/PromotionPage";
import { useAuth } from "./contexts/Authentication/AuthContext";
import { useEffect } from "react";
import AllProductPage from "./pages/ProductPage/AllProductPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "products", element: <AllProductPage /> },
      { path: "products/:id", element: <ProductListPage /> },
      { path: "product/:product_id", element: <ProductPage /> },
      { path: "/sale", element: <SalePage /> },
      { path: "*", element: <Homepage /> },
    ],
  },
]);

const routerAuthen = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "edit-profile", element: <PersonalInfo /> },
      { path: "edit-profile/addresses", element: <Addresses /> },
      { path: "my-purchases", element: <MyPurchase /> },
      { path: "my-purchases/order-status", element: <OrderStatus /> },
      { path: "my-purchases/:orderId", element: <OrderStatus /> },
      { path: "order-status", element: <OrderStatus /> },
      { path: "my-reviews", element: <MyReviews /> },
      { path: "my-cancellations", element: <MyCancellations /> },
      { path: "wishlists", element: <MyWishlist /> },
      { path: "cart", element: <CartPage /> },
      { path: "products/:category_id/:product_id", element: <ProductPage /> },
      { path: "products", element: <AllProductPage /> },
      { path: "products/:id", element: <ProductListPage /> },
      { path: "/sale", element: <SalePage /> },
      { path: "*", element: <Homepage /> },
    ],
  },
]);

const routerAdmin = createBrowserRouter([
  {
    path: "/",
    element: <LayoutAdmin />,
    children: [
      { path: "/", element: <AdminDashboard /> },
      { path: "/admin-sandbox", element: <AdminSandbox /> }, // test reusable component here.
      { path: "/users", element: <UserManager /> },
      { path: "/promotion", element: <PromotionPage /> },
      { path: "*", element: <AdminDashboard /> },
    ],
  },
]);

function App() {
  const { user } = useAuth();
  return (
    <>
      {user?.role === "admin" ? (
        <RouterProvider router={routerAdmin} />
      ) : user?.role === "user" ? (
        <RouterProvider router={routerAuthen} />
      ) : (
        <RouterProvider router={router} />
      )}
    </>
  );
}

export default App;
