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
  const [lastAddedProductId, setLastAddedProductId] = useState(null);
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
  const addToCart = async (product, quantity = 1) => {
    try {
      await axios.post(
        `${url}/shoppingcart/${user._id}/items`,
        { product_id: product._id, quantity },
        {
          withCredentials: true,
        },
      );
      toast.success(
        `Added ${quantity} × ${product?.product_name ?? "product"} to cart`,
        {
          richColors: true,
          position: "bottom-center",
        },
      );
      await getCart();
      setLastAddedProductId(product._id);
      openDrawer();
      return true;
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
      return false;
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
    getCart()
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`${url}/shoppingcart/${user._id}/items/${itemId}`, {
        withCredentials: true,
      });
      setLastAddedProductId((current) => {
        const removedProductId = data.find(
          (item) => item._id === itemId,
        )?.product_id?._id;
        return current && current === removedProductId ? null : current;
      });
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
      setLastAddedProductId(null);
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
        lastAddedProductId,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
