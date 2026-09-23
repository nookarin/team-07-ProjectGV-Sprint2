import { useEffect, useState } from "react";
import { CartContext } from "./CartProvider";
import { useAuth } from "../Authentication/AuthContext";
import axios from "axios";
import { useDebounce } from "use-debounce";

export function CartProvider({ children }) {
  const { url, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(null);
  const [debouncedValue] = useDebounce(cart, 500);
  const getCart = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/shoppingcart/${user._id}`);
    setData(response.data.cart.items);
    setLoading(false);
  };
  const addToCart = async (product) => {
    setCart([...cart, product]);
    try {
      const response = await axios.post(
        `${url}/shoppingcart/${user._id}/items`,
        { product_id: product._id, quantity: 1 },
      );
      const result = await axios.get(`${url}/shoppingcart/${user._id}`);
    } catch (error) {
      console.log("TEST",error);
    }
  };

  const updateQuantity = async (product_id, quantity) => {
    try {
      const response = await axios.patch(
        `${url}/shoppingcart/${user._id}/items/${product_id}`,
        { quantity },
      );
      setCart(response.data.cart.items);
    } catch (error) {
      console.log("TEST",error);
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
