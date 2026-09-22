import { useEffect, useState } from "react";
import { Gamepad2, PackagePlus, Table2 } from "lucide-react";
import { fromDoc } from "./ProductManager/productFormUtils";
import ProductForm from "#components/Admin/ProductManager/ProductForm";
import ProductList from "#components/Admin/ProductManager/ProductList";
import ProductTable from "#components/Admin/ProductManager/ProductTable";
import Header from "./Header";
import { readJson } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const res = await fetch(`${API_URL}/products`);
        const result = await readJson(res);
        if (!res.ok)
          throw new Error(result.message || "Failed to load products");
        if (!cancelled) setProducts((result.products ?? []).map(fromDoc));
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

  function upsertProduct(product) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      if (exists) {
        return current.map((item) =>
          item.id === product.id ? product : item,
        );
      }
      return [product, ...current];
    });
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setShowAll(false);
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await readJson(res);
      if (!res.ok)
        throw new Error(result.message || "Failed to delete product");

      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingProduct?.id === product.id) setEditingProduct(null);
    } catch (error) {
      window.alert(error.message);
    }
  }

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
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setShowAll((current) => !current);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-[#11101d] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-violet-400/40 hover:text-violet-200"
            >
              {showAll ? (
                <>
                  <PackagePlus className="size-4" aria-hidden="true" />
                  Add a product
                </>
              ) : (
                <>
                  <Table2 className="size-4" aria-hidden="true" />
                  Show all products ({products.length})
                </>
              )}
            </button>

            {showAll ? (
              <ProductTable
                products={products}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <ProductForm
                key={editingProduct?.id ?? "create"}
                editingProduct={editingProduct}
                onProductAdded={upsertProduct}
                onProductUpdated={upsertProduct}
                onCancelEdit={() => setEditingProduct(null)}
              />
            )}
          </div>
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
