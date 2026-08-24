import Register from "./pages/Register/Register";
import Homepage from "./pages/Homepage/Homepage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "#components/Layout";
import PersonalInfo from "./pages/User/01MyAccount/PersonalInfo"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "register", element: <Register /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
