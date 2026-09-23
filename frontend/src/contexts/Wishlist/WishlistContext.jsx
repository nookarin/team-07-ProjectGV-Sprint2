import { useEffect, useState } from "react";
import { WishlistContext } from "./WishlistProvider";
import { useAuth } from "../Authentication/AuthContext";
import axios from "axios";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

export function WishlistProvider({ children }) {
  const { url, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("Please login first.");

  const getWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`${url}/wishlists`, {
        withCredentials: true,
      });
      const current = (response.data.wishlist ?? []).find(
        (wishlist) => wishlist.user?._id === user._id,
      );
      setProducts(current?.products ?? []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load your wishlist.",
        { richColors: true, position: "bottom-center" },
      );
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!user) {
      setErr("Please login first.");
      toast.error(err, {
        richColors: true,
        position: "bottom-center",
      });
      return;
    }
    try {
      const response = await axios.post(
        `${url}/wishlists`,
        { user: user._id, product: product._id },
        { withCredentials: true },
      );
      toast.success(response.data.message || "Added to wishlist.", {
        richColors: true,
        position: "bottom-center",
      });
      await getWishlist();
    } catch (error) {
      console.log("TEST", error);
      toast.error(error.response?.data?.message || "Failed to add product.", {
        richColors: true,
        position: "bottom-center",
      });
    }
  };

  // refresh the wishlist whenever a different user logs in.
  useEffect(() => {
    getWishlist();
  }, [user?._id]);

  return (
    <WishlistContext.Provider
      value={{
        products,
        setProducts,
        addToWishlist,
        getWishlist,
        loading,
        err,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}