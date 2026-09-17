import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  ScrollText,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

const SORTABLE_COLUMNS = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "createdAt", label: "Created At" },
  { value: "updatedAt", label: "Updated At" },
];

const initialForm = {
  firstname: "",
  lastname: "",
  username: "",
  email: "",
  password: "",
  phoneNumber: "",
  role: "user",
  address: "",
};

function fullName(user) {
  if (!user) return "";
  const name = [user.firstname, user.lastname].filter(Boolean).join(" ").trim();
  return name || user.username || "—";
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fromDoc(doc) {
  return {
    firstname: doc.firstname ?? "",
    lastname: doc.lastname ?? "",
    username: doc.username ?? "",
    email: doc.email ?? "",
    password: "",
    phoneNumber: doc.phoneNumber != null ? String(doc.phoneNumber) : "",
    role: doc.role ?? "user",
    address: (doc.address ?? []).join(", "),
  };
}

function toPayload(form) {
  return {
    firstname: form.firstname.trim() || undefined,
    lastname: form.lastname.trim() || undefined,
    username: form.username.trim() || undefined,
    email: form.email.trim() || undefined,
    password: form.password || undefined,
    phoneNumber: form.phoneNumber.trim() === "" ? undefined : Number(form.phoneNumber),
    role: form.role,
    address: form.address
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  };
}

function validateUser(form, isEdit) {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = "Email is required";
  }

  if (!isEdit && !form.password) {
    errors.password = "Password is required";
  }

  if (form.phoneNumber.trim() !== "" && Number.isNaN(Number(form.phoneNumber))) {
    errors.phoneNumber = "Must be a valid number";
  }

  return errors;
}

function fromReviewDoc(doc) {
  return {
    id: doc._id,
    product: doc.product_id?.product_name ?? "Unknown Product",
    rating: doc.rating,
    date: formatDate(doc.createdAt),
    comment: doc.comment ?? "",
  };
}

function fromCartItemDoc(item) {
  return {
    id: item._id,
    product: item.product_name ?? "Unknown Product",
    tag: item.tag ?? "",
    unitPrice: item.unit_price,
    quantity: item.quantity,
    image: item.image ?? "",
  };
}

function RatingStars({ value, className }) {
  return (
    <span className={cn("flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-3.5",
            index < value ? "fill-amber-400 text-amber-400" : "text-slate-600",
          )}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-sm font-medium text-rose-400" role="alert">
      {message}
    </p>
  );
}

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState({ name: "", email: "", address: "" });
  const [query, setQuery] = useState({ name: "", email: "", address: "" }); // debounced
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("asc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0); //เพิ่มเมื่ออัปเดต list เช่น สร้าง/แก้ไข/ลบ user

  const [inspectingUser, setInspectingUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [detailTab, setDetailTab] = useState("reviews");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setLoadError("");
      try {
        const params = new URLSearchParams();
        if (query.name) params.set("name", query.name);
        if (query.email) params.set("email", query.email);
        if (query.address) params.set("address", query.address);
        params.set("sort", sort);
        params.set("order", order);

        const res = await fetch(`${API_URL}/users?${params.toString()}`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to load users");
        if (!cancelled) setUsers((result.data ?? []).map((doc) => ({ ...doc, id: doc._id })));
      } catch (error) {
        if (!cancelled) setLoadError(error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [query, sort, order, refreshKey]);

  function handleSearchChange(field) {
    return (event) => {
      const { value } = event.target;
      setSearch((current) => ({ ...current, [field]: value }));
    };
  }

  function toggleSort(field) {
    if (sort === field) {
      setOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder("asc");
    }
  }

  function openCreate() {
    setEditingUser(null);
    setForm(initialForm);
    setFormErrors({});
    setDialogOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm(fromDoc(user));
    setFormErrors({});
    setDialogOpen(true);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((current) => ({ ...current, [name]: undefined }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const isEdit = Boolean(editingUser);
    const nextErrors = validateUser(form, isEdit);
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit ? `${API_URL}/users/${editingUser.id}` : `${API_URL}/users/register`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save user");

      toast.success(isEdit ? "User updated successfully" : "User created successfully");
      setDialogOpen(false);
      setForm(initialForm);
      setEditingUser(null);
      setRefreshKey((current) => current + 1); //โหลด list ใหม่ให้เห็น user ที่เพิ่ม/แก้ไข
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/users/${deletingUser.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete user");

      toast.success("User deleted successfully");
      setDeletingUser(null);
      setRefreshKey((current) => current + 1); //โหลด list ใหม่หลังลบ
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  }

  async function loadUserDetails(user) {
    setInspectingUser(user);
    setDetailTab("reviews");
    setReviews([]);
    setCartItems([]);
    setDetailsLoading(true);

    let errorMsg = "";
    try {
      const [reviewRes, cartRes] = await Promise.all([
        fetch(`/api/v1/reviews?userId=${user.id}`),
        fetch(`/api/v1/shoppingcart/${user.id}`),
      ]);

      const reviewResult = await reviewRes.json().catch(() => ({}));
      const cartResult = await cartRes.json().catch(() => ({}));

      if (!reviewRes.ok) {
        errorMsg = reviewResult.message || "Failed to load reviews";
      } else {
        setReviews((reviewResult.data ?? []).map(fromReviewDoc));
      }

      if (!cartRes.ok) {
        errorMsg = errorMsg || cartResult.message || "Failed to load shopping cart";
      } else {
        setCartItems((cartResult.data?.items ?? []).map(fromCartItemDoc));
      }
    } catch (error) {
      errorMsg = error.message;
    } finally {
      setDetailsError(errorMsg);
      setDetailsLoading(false);
    }
  }

  function closeInspector() {
    setInspectingUser(null);
    setReviews([]);
    setCartItems([]);
    setDetailTab("reviews");
    setDetailsError("");
  }

  const fieldClass = (field) =>
    cn(
      "mt-2 w-full rounded-xl border bg-[#11101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/30",
      formErrors[field]
        ? "border-rose-500 focus:border-rose-400"
        : "border-white/10 focus:border-violet-400",
    );

  const SortIcon = ({ field }) => {
    if (sort !== field) return <ArrowUpDown className="size-3.5 text-slate-500" />;
    return order === "asc" ? (
      <ArrowUp className="size-3.5 text-violet-300" />
    ) : (
      <ArrowDown className="size-3.5 text-violet-300" />
    );
  };

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Gear Vault Admin
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">User Manager</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Create, search, sort, and manage every account in your MongoDB store.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3">
              <Users className="size-5 text-violet-300" aria-hidden="true" />
              <span className="text-sm font-semibold">{users.length} users</span>
            </div>
            <Button
              onClick={openCreate}
              className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold hover:from-violet-500 hover:to-fuchsia-500"
            >
              <Plus className="size-4" aria-hidden="true" /> Add User
            </Button>
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#11101d] shadow-2xl shadow-violet-950/20">
          <div className="grid gap-4 border-b border-white/10 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:p-6">
            {[
              { field: "name", label: "Search name", placeholder: "e.g. Kim or Winter" },
              { field: "email", label: "Search email", placeholder: "e.g. user@mail.com" },
              { field: "address", label: "Search address", placeholder: "e.g. Bangkok" },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <Label htmlFor={`search-${field}`} className="text-sm font-semibold text-slate-200">
                  {label}
                </Label>
                <div className="relative mt-2">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-500"
                    aria-hidden="true"
                  />
                  <input
                    id={`search-${field}`}
                    className="w-full rounded-xl border border-white/10 bg-[#090813] py-3 pr-4 pl-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                    value={search[field]}
                    onChange={handleSearchChange(field)}
                    placeholder={placeholder}
                  />
                </div>
              </div>
            ))}

            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-sm font-semibold text-slate-200">Sort by</Label>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {SORTABLE_COLUMNS.map((column) => (
                  <button
                    key={column.value}
                    type="button"
                    onClick={() => toggleSort(column.value)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                      sort === column.value
                        ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                        : "border-white/10 bg-[#090813] text-slate-400 hover:border-violet-400/30 hover:text-slate-200",
                    )}
                  >
                    {column.label}
                    <SortIcon field={column.value} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadError && (
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
              <p className="text-sm text-rose-300" role="alert">{loadError}</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="size-4" aria-hidden="true" /> Retry
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Address</th>
                  <th className="px-6 py-4 font-semibold">Created At</th>
                  <th className="px-6 py-4 font-semibold">Updated At</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="size-10 animate-pulse text-slate-600" aria-hidden="true" />
                        <p className="font-semibold text-slate-300">Loading users...</p>
                        <p className="text-sm text-slate-500">Fetching from MongoDB.</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="size-10 text-slate-600" aria-hidden="true" />
                        <p className="font-semibold text-slate-300">No users found</p>
                        <p className="text-sm text-slate-500">
                          {search.name || search.email || search.address
                            ? "Try adjusting your search filters."
                            : "Create your first user to get started."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => loadUserDetails(user)}
                          className="group flex items-center gap-3 text-left"
                          title={`View ${fullName(user)} reviews & shopping cart`}
                        >
                          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white">
                            {fullName(user)
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold transition group-hover:text-violet-300">
                              {fullName(user)}
                            </p>
                            <p className="text-xs text-slate-500">@{user.username || "—"}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{user.email}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {user.phoneNumber != null ? user.phoneNumber.toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={user.role === "admin" ? "default" : "secondary"}
                          className={cn(
                            user.role === "admin" && "bg-violet-500/20 text-violet-200",
                          )}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="max-w-56 px-6 py-4 text-slate-400">
                        {user.address?.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {/* {user.address.map((line) => (
                              <span
                                key={line}
                                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300"
                              >
                                {line}
                              </span>
                            ))} */}
                            <p>address</p>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(user.updatedAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => loadUserDetails(user)}
                            variant="ghost"
                            size="icon-sm"
                            className="text-slate-400 hover:text-cyan-300"
                            aria-label={`View ${fullName(user)} reviews & shopping cart`}
                            title="Reviews & shopping cart"
                          >
                            <Eye />
                          </Button>
                          <Button
                            onClick={() => openEdit(user)}
                            variant="ghost"
                            size="icon-sm"
                            className="text-slate-400 hover:text-violet-300"
                            aria-label={`Edit ${fullName(user)}`}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            onClick={() => setDeletingUser(user)}
                            variant="ghost"
                            size="icon-sm"
                            className="text-slate-400 hover:text-rose-400"
                            aria-label={`Delete ${fullName(user)}`}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl border-violet-400/20 bg-[#11101d] text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingUser ? "Edit User" : "Add User"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingUser
                  ? "Update the details for this account."
                  : "Create a new account for your store."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstname" className="text-slate-200">First name</Label>
                  <input
                    id="firstname"
                    name="firstname"
                    value={form.firstname}
                    onChange={updateField}
                    className={fieldClass("firstname")}
                    placeholder="e.g. Kim"
                  />
                </div>
                <div>
                  <Label htmlFor="lastname" className="text-slate-200">Last name</Label>
                  <input
                    id="lastname"
                    name="lastname"
                    value={form.lastname}
                    onChange={updateField}
                    className={fieldClass("lastname")}
                    placeholder="e.g. Winter"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-slate-200">Username</Label>
                  <input
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={updateField}
                    className={fieldClass("username")}
                    placeholder="Defaults to email prefix"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-slate-200">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={updateField}
                    className={fieldClass("role")}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-200">Email <span className="text-rose-400">*</span></Label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    className={fieldClass("email")}
                    placeholder="e.g. user@shop.com"
                    aria-invalid={Boolean(formErrors.email)}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  <FieldError message={formErrors.email} />
                </div>
                <div>
                  <Label htmlFor="password" className="text-slate-200">Password</Label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={updateField}
                    className={fieldClass("password")}
                    placeholder={editingUser ? "Leave blank to keep current" : "Required"}
                    aria-invalid={Boolean(formErrors.password)}
                    aria-describedby={formErrors.password ? "password-error" : undefined}
                  />
                  <FieldError message={formErrors.password} />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-slate-200">Phone number</Label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="text"
                    inputMode="numeric"
                    value={form.phoneNumber}
                    onChange={updateField}
                    className={fieldClass("phoneNumber")}
                    placeholder="e.g. 0812345678"
                    aria-invalid={Boolean(formErrors.phoneNumber)}
                    aria-describedby={formErrors.phoneNumber ? "phone-error" : undefined}
                  />
                  <FieldError message={formErrors.phoneNumber} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address" className="text-slate-200">Address</Label>
                  <input
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    className={fieldClass("address")}
                    placeholder="e.g. 123 Rama Rd, Bangkok, Thailand"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                  className="text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold hover:from-violet-500 hover:to-fuchsia-500 disabled:from-violet-600/50 disabled:to-fuchsia-600/50"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {submitting ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
          <DialogContent className="border-rose-400/20 bg-[#11101d] text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Delete user</DialogTitle>
              <DialogDescription className="text-slate-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {deletingUser ? fullName(deletingUser) : ""}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeletingUser(null)}
                className="text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-2"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                {deleting ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      <Dialog open={Boolean(inspectingUser)} onOpenChange={(open) => !open && closeInspector()}>
          <DialogContent className="max-w-3xl border-violet-400/20 bg-[#11101d] text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {fullName(inspectingUser)}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Activity for <span className="font-medium text-slate-300">{inspectingUser?.email}</span> — reviews & shopping cart.
              </DialogDescription>
            </DialogHeader>

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDetailTab("reviews")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  detailTab === "reviews"
                    ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                    : "border-white/10 bg-[#090813] text-slate-400 hover:border-violet-400/30 hover:text-slate-200",
                )}
              >
                <ScrollText className="size-4" aria-hidden="true" />
                Reviews{!detailsLoading && ` (${reviews.length})`}
              </button>
              <button
                type="button"
                onClick={() => setDetailTab("cart")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  detailTab === "cart"
                    ? "border-violet-400/50 bg-violet-500/20 text-violet-200"
                    : "border-white/10 bg-[#090813] text-slate-400 hover:border-violet-400/30 hover:text-slate-200",
                )}
              >
                <ShoppingCart className="size-4" aria-hidden="true" />
                Shopping Cart{!detailsLoading && ` (${cartItems.length})`}
              </button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => loadUserDetails(inspectingUser)}
                className="ml-auto gap-2 text-slate-300 hover:text-violet-300"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Refresh
              </Button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#090813]">
              {detailsLoading ? (
                <div className="flex flex-col items-center gap-3 px-6 py-16">
                  <ScrollText className="size-10 animate-pulse text-slate-600" aria-hidden="true" />
                  <p className="font-semibold text-slate-300">Loading activity...</p>
                  <p className="text-sm text-slate-500">Fetching from MongoDB.</p>
                </div>
              ) : detailsError ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm font-medium text-rose-300" role="alert">{detailsError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadUserDetails(inspectingUser)}
                    className="mt-4 gap-2"
                  >
                    <RefreshCw className="size-4" aria-hidden="true" /> Retry
                  </Button>
                </div>
              ) : detailTab === "reviews" ? (
                reviews.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                    <ScrollText className="size-10 text-slate-700" aria-hidden="true" />
                    <p className="font-semibold text-slate-300">No reviews yet</p>
                    <p className="text-sm text-slate-500">
                      This user hasn't written any product reviews.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {reviews.map((review) => (
                      <li key={review.id} className="flex items-start justify-between gap-4 px-6 py-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{review.product}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <RatingStars value={review.rating} />
                            <span className="text-xs text-slate-500">{review.date}</span>
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-sm leading-6 text-slate-400">{review.comment}</p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className="shrink-0 bg-violet-500/10 text-violet-200"
                        >
                          {review.rating}/5
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                  <ShoppingCart className="size-10 text-slate-700" aria-hidden="true" />
                  <p className="font-semibold text-slate-300">Shopping cart is empty</p>
                  <p className="text-sm text-slate-500">
                    This user doesn't have any items in their active cart.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-[#11101d]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.product}
                            className="size-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="size-5 text-slate-600" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{item.product}</p>
                        {item.tag && (
                          <p className="truncate text-xs text-slate-500">{item.tag}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${item.unitPrice.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">
                          × {item.quantity} = ${(item.unitPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}