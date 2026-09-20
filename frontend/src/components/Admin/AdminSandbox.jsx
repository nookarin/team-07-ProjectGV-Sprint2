import { useEffect, useState } from "react";
import ProductForm from "#components/Admin/ProductManager/ProductForm";
import ProductList from "#components/Admin/ProductManager/ProductList";
import UserSearch from "#components/Admin/UserManager/UserSearch";
import UserList from "#components/Admin/UserManager/UserList";
import { fromDoc } from "./ProductManager/productFormUtils";
import { DEFAULT_USER_QUERY } from "./UserManager/userUtils";
import { readJson } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL;
const USERS_API_URL = import.meta.env.VITE_API_URL;

export default function AdminSandbox() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [userQuery, setUserQuery] = useState(DEFAULT_USER_QUERY);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const res = await fetch(`${API_URL}/products`);
        const result = await readJson(res);
        if (!res.ok) throw new Error(result.message || "Failed to load products");
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

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setUsersLoading(true);
      setUsersError("");
      try {
        const params = new URLSearchParams();
        if (userQuery.name) params.set("name", userQuery.name);
        if (userQuery.email) params.set("email", userQuery.email);
        if (userQuery.address) params.set("address", userQuery.address);
        params.set("sort", userQuery.sort);
        params.set("order", userQuery.order);

        const res = await fetch(`${USERS_API_URL}/users?${params.toString()}`);
        const result = await readJson(res);
        if (!res.ok) throw new Error(result.message || "Failed to load users");
        if (!cancelled) setUsers((result.data ?? []).map((doc) => ({ ...doc, id: doc._id })));
      } catch (error) {
        if (!cancelled) setUsersError(error.message);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [userQuery]);

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Admin Sandbox
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">Testing Sandbox</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Test external components dai ley na ja juub juub
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <ProductForm
            onProductAdded={(product) => setProducts((current) => [product, ...current])}
          />
          <ProductList products={products} loading={loading} loadError={loadError} />
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#11101d] shadow-2xl shadow-violet-950/20">
          <div className="border-b border-white/10 p-6 lg:p-8">
            <h2 className="text-xl font-bold">User Manager (UserSearch + UserList)</h2>
            <p className="mt-1 text-sm text-slate-400">
              Reusable search & list — actions logged to the console.
            </p>
          </div>

          <UserSearch onQuery={setUserQuery} />

          <UserList
            users={users}
            loading={usersLoading}
            loadError={usersError}
            onRetry={() => setUserQuery({ ...userQuery })}
            onView={(user) => console.log("View user:", user)}
            onEdit={(user) => console.log("Edit user:", user)}
            onDelete={(user) => console.log("Delete user:", user)}
            hasActiveFilters={Boolean(userQuery.name || userQuery.email || userQuery.address)}
          />
        </section>
      </div>
    </main>
  );
}