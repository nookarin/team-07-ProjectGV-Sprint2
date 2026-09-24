import { useEffect, useState } from "react";
import { Heart, LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import AccountSidebar from "../AccountSidebar";
import LoadingScreen from "@/components/LoadingScreen";

// Shared loader: GET every stored wishlist (the backend returns all of them
// populated) and return only the products saved by the given user.
async function fetchWishlistData(baseUrl, userId) {
  const response = await axios.get(`${baseUrl}/wishlists`, {
    withCredentials: true,
  });
  const current = (response.data.wishlist ?? []).find(
    (wishlist) => wishlist.user?._id === userId,
  );
  return current?.products ?? [];
}

// Wishlist page: lets the logged-in user search the product catalog,
// add products to their wishlist, and remove them from it.
export default function MyWishlist() {
  const { url, user } = useAuth();
  const [products, setProducts] = useState([]); // products currently in the wishlist
  const [loading, setLoading] = useState(true); // true while loading the wishlist
  const [searchTerm, setSearchTerm] = useState(""); // text currently in the search box
  const [searchResults, setSearchResults] = useState([]); // products found by the search
  const [searching, setSearching] = useState(false); // true while a search request is in flight
  const [pendingId, setPendingId] = useState(null); // productId being added/removed right now

  // Load the wishlist once the page mounts (and whenever the user changes).
  // The first statement awaits an external fetch, so none of the setState
  // calls here are synchronous within the effect body.
  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    async function init() {
      try {
        const list = await fetchWishlistData(url, user._id);
        if (!cancelled) setProducts(list);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error.response?.data?.message || "Failed to load your wishlist.",
            { richColors: true, position: "top-center" },
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [url, user?._id]);

  // Search the whole product catalog, then filter the results on the client:
  // only products whose name matches the term and that are not already saved.
  async function handleSearch(event) {
    event.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;
    setSearching(true);
    try {
      const response = await axios.get(`${url}/products`);
      const wishlistIds = new Set(products.map((p) => p._id));
      const results = (response.data.products ?? []).filter(
        (p) =>
          p.product_name?.toLowerCase().includes(term) &&
          !wishlistIds.has(p._id),
      );
      setSearchResults(results);
      if (results.length === 0) {
        toast.info("No matching products found.", {
          richColors: true,
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Search failed.", {
        richColors: true,
        position: "top-center",
      });
    } finally {
      setSearching(false);
    }
  }

  // POST the product id to the wishlist endpoint (backed upserts with $addToSet),
  // then refresh the wishlist and drop the product from the search results.
  async function handleAdd(productId) {
    setPendingId(productId);
    try {
      const response = await axios.post(
        `${url}/wishlists`,
        { user: user._id, product: productId },
        { withCredentials: true },
      );
      toast.success(response.data.message || "Added to wishlist.", {
        richColors: true,
        position: "top-center",
      });
      setSearchResults((current) => current.filter((p) => p._id !== productId));
      setProducts(await fetchWishlistData(url, user._id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product.", {
        richColors: true,
        position: "top-center",
      });
    } finally {
      setPendingId(null);
    }
  }

  // DELETE /wishlists/:productId (the user id travels in the body) removes
  // the product, then removes it from local state immediately.
  async function handleRemove(productId) {
    setPendingId(productId);
    try {
      const response = await axios.delete(`${url}/wishlists/${productId}`, {
        data: { user: user._id },
        withCredentials: true,
      });
      toast.success(response.data.message || "Removed from wishlist.", {
        richColors: true,
        position: "top-center",
      });
      setProducts((current) => current.filter((p) => p._id !== productId));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove product.",
        { richColors: true, position: "top-center" },
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      {/* Show full-screen LoadingScreen while the wishlist API request is being fetched */}
      {loading && <LoadingScreen />}
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[60px]">
        <AccountSidebar active="/wishlists" />

        <section aria-labelledby="wishlist-heading">
          {/* Heading plus the number of saved items */}
          <div className="mb-5 flex items-center justify-between">
            <h1 id="wishlist-heading" className="text-base font-bold">
              My Wishlist
            </h1>
            <span className="text-xs text-[#8B86A5]">
              {products.length} item{products.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Search form to find products that can be added to the wishlist */}
          <form
            onSubmit={handleSearch}
            className="mb-6 flex gap-2"
            role="search"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products to add to wishlist..."
              className="w-full rounded-lg border border-[#2A2A45] bg-[#090813] px-3 py-2 text-sm text-white outline-none focus:border-[#22D3EE]"
            />
            <button
              type="submit"
              disabled={searching}
              className="flex items-center gap-1.5 rounded-lg bg-[#22D3EE] px-4 py-2 text-xs font-bold text-[#090813] transition-colors hover:bg-[#A5F3FC] disabled:opacity-60"
            >
              <Search className="size-3.5" />
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Products returned by the search, each with an "Add" button */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#8B86A5]">
                Add from search
              </h2>
              <div className="space-y-3">
                {searchResults.map((product) => (
                  <article
                    key={product._id}
                    className="flex items-center gap-4 rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-4"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="h-16 w-16 rounded-lg border border-[#2A2A45] object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#2A2A45] bg-[#090813]">
                        <Heart className="size-5 text-[#F9A8D4]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-white">
                        {product.product_name}
                      </h3>
                      <p className="text-sm font-semibold text-[#8B5CF6]">
                        ${product.price}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdd(product._id)}
                      disabled={pendingId === product._id}
                      className="flex items-center gap-1 rounded-lg bg-[#F9A8D4]/10 px-3 py-1.5 text-xs font-bold text-[#F9A8D4] transition-colors hover:bg-[#F9A8D4]/20 disabled:opacity-60"
                    >
                      {pendingId === product._id ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Plus className="size-3.5" />
                      )}
                      Add
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* The user's saved products, each with a "Remove" button */}
          {loading ? (
            <p className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5 text-sm text-[#8B86A5]">
              Loading your wishlist...
            </p>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-8 text-center">
              <Heart className="mx-auto mb-3 size-8 text-[#F9A8D4]" />
              <p className="text-sm text-[#8B86A5]">
                Your wishlist is empty. Search above and add products.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="flex items-center gap-4 rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-4"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-16 w-16 rounded-lg border border-[#2A2A45] object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#2A2A45] bg-[#090813]">
                      <Heart className="size-5 text-[#F9A8D4]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-white">
                      {product.product_name}
                    </h3>
                    <p className="text-sm font-semibold text-[#8B5CF6]">
                      ${product.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(product._id)}
                    disabled={pendingId === product._id}
                    className="flex items-center gap-1 rounded-lg border border-[#2A2A45] px-3 py-1.5 text-xs font-semibold text-[#F9A8D4] transition-colors hover:border-[#F472B6] disabled:opacity-60"
                  >
                    {pendingId === product._id ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Remove
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
