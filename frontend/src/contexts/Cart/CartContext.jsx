import { useEffect, useMemo, useState } from "react";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const cartCount = useMemo(
    () => data.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [data],
  );
  const cartSubtotal = useMemo(
    () =>
      data.reduce(
        (sum, item) =>
          sum + (item.quantity || 0) * (item.product_id?.price || 0),
        0,
      ),
    [data],
  );

  const getCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`${url}/shoppingcart/${user._id}`, {
        withCredentials: true,
      });
      setLoading(false);
      setData(response.data?.cart?.items ?? []);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const addToCart = async (product) => {
    try {
      await axios.post(
        `${url}/shoppingcart/${user._id}/items`,
        { product_id: product._id, quantity: 1 },
        {
          withCredentials: true,
        },
      );
      toast.success("Added Product to Cart", {
        richColors: true,
        position: "bottom-center",
      });
      getCart();
    } catch (error) {
      console.log("ERROR:", error, error?.response);
      if (!user) {
        toast.error("Please login first.", {
          richColors: true,
          position: "bottom-center",
        });
      } else {
        toast.error(error?.response?.data?.message, {
          richColors: true,
          position: "bottom-center",
        });
      }
    }
  };

  const updateQuantity = async (product_id, quantity) => {
    try {
      const response = await axios.patch(
        `${url}/shoppingcart/${user._id}/items/${product_id}`,
        { quantity },
        { withCredentials: true },
      );
      setCart(response.data.cart.items);
      getCart();
    } catch (error) {
      console.log("TEST", error);
      getCart();
    }
  };

  const handleClearAll = async () => {
    const response = await axios.delete(`${url}/shoppingcart/${user._id}`, {
      withCredentials: true,
    });
    console.log(response);
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`${url}/shoppingcart/${user._id}/items/${itemId}`, {
        withCredentials: true,
      });
      setLastAddedId((current) => (current === itemId ? null : current));
      getCart();
    } catch (error) {
      console.log("ERROR:", error, error?.response);
      toast.error(error?.response?.data?.message || "Failed to remove item.", {
        richColors: true,
        position: "bottom-center",
      });
      getCart();
    }
  };

  useEffect(() => {
    if (user) {
      getCart();
    } else {
      setData([]);
    }
  }, [user]);
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
        handleClearAll,
        handleRemoveItem,
        drawerOpen,
        openDrawer,
        closeDrawer,
        lastAddedId,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
