import { useEffect, useState } from "react";
import { CartContext } from "./CartProvider";
import { useAuth } from "../Authentication/AuthContext";
import axios from "axios";

export function CartProvider({ children }) {
  const { url, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(null);
  const getCart = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/shoppingcart/${user._id}`);
    console.log(response.data.cart.items);
    setData(response.data.cart.items);
    setLoading(false);
  };
  const addToCart = async (product) => {
    console.log(user);
    console.log(product);
    setCart([...cart, product]);
    try {
      const response = await axios.post(
        `${url}/shoppingcart/${user._id}/items`,
        { product_id: product._id, quantity: 1 },
      );
      const result = await axios.get(`${url}/shoppingcart/${user._id}`);
      console.log(result);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCart();
  }, [cart]);
  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, getCart, loading, data }}>
      {children}
    </CartContext.Provider>
  );
}
