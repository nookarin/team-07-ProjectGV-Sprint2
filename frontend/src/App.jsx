import CartPage from "./pages/ShoppingCart/CartPage"
import Register from "./pages/Register/Register"
import Homepage from "./pages/Homepage/Homepage"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Layout from "#components/Layout"
import PersonalInfo from "./pages/User/01MyAccount/PersonalInfo"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: "register", element: <Register /> },
      { path: "edit-profile", element: <PersonalInfo /> },
      { path: "cart-page", element: <CartPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
