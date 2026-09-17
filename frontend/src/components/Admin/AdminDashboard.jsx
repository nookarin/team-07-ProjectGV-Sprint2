import { useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";
import { fromDoc } from "./ProductManager/productFormUtils";
import ProductForm from "#components/Admin/ProductManager/ProductForm";
import ProductList from "#components/Admin/ProductManager/ProductList";
import Header from "./Header";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const res = await fetch(`${API_URL}/products`);
        const result = await res.json();
        if (!res.ok)
          throw new Error(result.message || "Failed to load products");
        if (!cancelled) setProducts((result.data ?? []).map(fromDoc));
      } catch (error) {
        if (!cancelled) setLoadError(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Header
            heading={"Product Manager"}
            desc={
              "Add gaming gear to your catalogue and keep inventory ready for battle."
            }
          />
          <div className="flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3">
            <Gamepad2 className="size-5 text-violet-300" aria-hidden="true" />
            <span className="text-sm font-semibold">
              {products.length} products added
            </span>
          </div>
        </header>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <ProductForm
            onProductAdded={(product) =>
              setProducts((current) => [product, ...current])
            }
          />
          <ProductList
            products={products}
            loading={loading}
            loadError={loadError}
          />
        </div>
      </div>
    </main>
  );
}

{
  /* <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Gear Vault Admin
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">Product Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Add gaming gear to your catalogue and keep inventory ready for battle.
            </p>
          </div> */
}
