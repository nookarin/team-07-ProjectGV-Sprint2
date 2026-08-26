import CartPage from "./pages/ShoppingCart/CartPage";
import Register from "./pages/Register/Register";
import Homepage from "./pages/Homepage/Homepage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "#components/Layout";
import ProductPage from "./pages/ProductPage/ProductPage";
import PersonalInfo from "./pages/User/01MyAccount/PersonalInfo";
import Addresses from "./pages/User/01MyAccount/Addresses";
import MyPurchase from "./pages/User/02MyPurchase/MyPurchase";
import MyReviews from "./pages/User/03MyReviews/MyReviews";
import MyCancellations from "./pages/User/04MyCancellations/MyCancellations";
import ProductListPage from "./pages/ProductPage/ProductListPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "register", element: <Register /> },
      { path: "edit-profile", element: <PersonalInfo /> },
      { path: "edit-profile/addresses", element: <Addresses /> },
      { path: "my-purchases", element: <MyPurchase /> },
      { path: "my-reviews", element: <MyReviews /> },
      { path: "my-cancellations", element: <MyCancellations /> },
      { path: "cart-page", element: <CartPage /> },
      { path: "product", element: <ProductPage /> }, // products/:category_id/:product_id
      { path: "products", element: <ProductListPage />}
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
