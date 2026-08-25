import CartPage from "./pages/ShoppingCart/CartPage"
import Register from "./pages/Register/Register"
import Homepage from "./pages/Homepage/Homepage"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Layout from "#components/Layout"
import PersonalInfo from "./pages/User/01MyAccount/PersonalInfo"
import Addresses from "./pages/User/01MyAccount/Addresses"
import MyPurchase from "./pages/User/02MyPurchase/MyPurchase"
import MyReviews from "./pages/User/03MyReviews/MyReviews"
import MyCancellations from "./pages/User/04MyCancellations/MyCancellations"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "register", element: <Register /> },
      { path: 'edit-profiles', element: <PersonalInfo />},
      { path: 'edit-profiles/addresses', element: <Addresses />},
      { path: 'my-purchases', element: <MyPurchase />},
      { path: 'my-reviews', element: <MyReviews />},
      { path: 'my-cancellations', element: <MyCancellations />},
    ],
  },
    
]);

function App() {
  return <RouterProvider router={router} />;
  
      { path: "edit-profile", element: <PersonalInfo /> },
      { path: "cart-page", element: <CartPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
