import { useEffect, useState } from "react";
import { CartContext } from "./CartProvider";
import { useAuth } from "../Authentication/AuthContext";
import axios from "axios";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

export function CartProvider({ children }) {
  const { url, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(null);
  const [err, setErr] = useState("Please login first");
  const getCart = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/shoppingcart/${user._id}`);
    setData(response.data.cart.items);
    setLoading(false);
  };
  const addToCart = async (product) => {
    if (!user) {
      setErr("Please login first.");
      toast.error(err, {
        richColors: true,
        position: "bottom-center",
      });
    }
    setCart([...cart, product]);
    try {
      const response = await axios.post(
        `${url}/shoppingcart/${user._id}/items`,
        { product_id: product._id, quantity: 1 },
      );
      const result = await axios.get(`${url}/shoppingcart/${user._id}`);
      toast.success("Added Product to Cart", {
        richColors: true,
        position: "bottom-center",
      });
      console.log(result);
      getCart();
    } catch (error) {
      console.log("ERROR:", error?.response);
      toast.error(error?.response?.data?.message, {
        richColors: true,
        position: "bottom-center",
      });
    }
  };

  const updateQuantity = async (product_id, quantity) => {
    try {
      const response = await axios.patch(
        `${url}/shoppingcart/${user._id}/items/${product_id}`,
        { quantity },
      );
      setCart(response.data.cart.items);
      getCart();
    } catch (error) {
      console.log("TEST", error);
      getCart();
    }
  };

  useEffect(() => {
    getCart();
  }, [cart]);
  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        getCart,
        loading,
        data,
        updateQuantity,
        err,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
