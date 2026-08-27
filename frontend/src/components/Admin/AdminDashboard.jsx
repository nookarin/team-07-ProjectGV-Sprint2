import { useState } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  Gamepad2,
  PackagePlus,
  Tag,
} from "lucide-react";

const initialForm = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  date: "",
  tag: "",
};

const tags = ["Controller", "Keyboard", "Mouse", "Headset", "Accessory"];

function validateProduct(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Name is required";
  if (!values.description.trim()) errors.description = "Description is required";

  if (values.price === "") {
    errors.price = "Price is required";
  } else if (Number(values.price) <= 0) {
    errors.price = "Price must be greater than 0";
  }

  if (values.quantity === "") {
    errors.quantity = "Quantity is required";
  } else if (Number(values.quantity) <= 0) {
    errors.quantity = "Quantity must be greater than 0";
  } else if (!Number.isInteger(Number(values.quantity))) {
    errors.quantity = "Quantity must be a whole number";
  }

  if (!values.date) errors.date = "Date is required";
  if (!values.tag) errors.tag = "Tag is required";

  return errors;
}

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-rose-400" role="alert">
      {message}
    </p>
  );
}

export default function AdminDashboard() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
    setSuccessMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProduct(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSuccessMessage("");
      return;
    }

    setProducts((current) => [
      {
        ...form,
        id: crypto.randomUUID(),
        price: Number(form.price),
        quantity: Number(form.quantity),
      },
      ...current,
    ]);
    setForm(initialForm);
    setErrors({});
    setSuccessMessage(`${form.name} was added successfully.`);
  }

  const fieldClass = (field) =>
    `mt-2 w-full rounded-xl border bg-[#11101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/30 ${
      errors[field]
        ? "border-rose-500 focus:border-rose-400"
        : "border-white/10 focus:border-violet-400"
    }`;

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Gear Vault Admin
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">Product Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Add gaming gear to your catalogue and keep inventory ready for battle.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3">
            <Gamepad2 className="size-5 text-violet-300" aria-hidden="true" />
            <span className="text-sm font-semibold">{products.length} products added</span>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#11101d] shadow-2xl shadow-violet-950/20">
            <div className="relative border-b border-white/10 bg-gradient-to-r from-violet-700/40 via-fuchsia-600/20 to-cyan-500/20 p-6 sm:p-8">
              <div className="absolute -right-10 -top-12 size-40 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-500/30">
                  <PackagePlus aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Add a product</h2>
                  <p className="mt-1 text-sm text-slate-300">All fields are required.</p>
                </div>
              </div>
            </div>

            <form className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8" onSubmit={handleSubmit} noValidate>
              <div className="sm:col-span-2">
                <label htmlFor="name" className="text-sm font-semibold text-slate-200">Product name</label>
                <input id="name" name="name" value={form.name} onChange={updateField} className={fieldClass("name")} placeholder="e.g. Nova Pro Controller" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
                <FieldError id="name-error" message={errors.name} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="text-sm font-semibold text-slate-200">Description</label>
                <textarea id="description" name="description" value={form.description} onChange={updateField} className={`${fieldClass("description")} min-h-28 resize-y`} placeholder="Describe features, compatibility, and highlights" aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "description-error" : undefined} />
                <FieldError id="description-error" message={errors.description} />
              </div>

              <div>
                <label htmlFor="price" className="flex items-center gap-2 text-sm font-semibold text-slate-200"><CircleDollarSign className="size-4 text-violet-300" />Price</label>
                <input id="price" name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={updateField} className={fieldClass("price")} placeholder="0.00" aria-invalid={Boolean(errors.price)} aria-describedby={errors.price ? "price-error" : undefined} />
                <FieldError id="price-error" message={errors.price} />
              </div>

              <div>
                <label htmlFor="quantity" className="flex items-center gap-2 text-sm font-semibold text-slate-200"><PackagePlus className="size-4 text-violet-300" />Quantity</label>
                <input id="quantity" name="quantity" type="number" min="1" step="1" value={form.quantity} onChange={updateField} className={fieldClass("quantity")} placeholder="1" aria-invalid={Boolean(errors.quantity)} aria-describedby={errors.quantity ? "quantity-error" : undefined} />
                <FieldError id="quantity-error" message={errors.quantity} />
              </div>

              <div>
                <label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-slate-200"><CalendarDays className="size-4 text-violet-300" />Date</label>
                <input id="date" name="date" type="date" value={form.date} onChange={updateField} className={`${fieldClass("date")} [color-scheme:dark]`} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "date-error" : undefined} />
                <FieldError id="date-error" message={errors.date} />
              </div>

              <div>
                <label htmlFor="tag" className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Tag className="size-4 text-violet-300" />Tag</label>
                <select id="tag" name="tag" value={form.tag} onChange={updateField} className={fieldClass("tag")} aria-invalid={Boolean(errors.tag)} aria-describedby={errors.tag ? "tag-error" : undefined}>
                  <option value="">Select a tag</option>
                  {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                </select>
                <FieldError id="tag-error" message={errors.tag} />
              </div>

              <div className="sm:col-span-2">
                {successMessage && <p className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300" role="status">{successMessage}</p>}
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 font-bold transition hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#11101d]">
                  <PackagePlus className="size-5" aria-hidden="true" /> Add Product
                </button>
              </div>
            </form>
          </section>

          <aside>
            <h2 className="text-xl font-bold">Recently added</h2>
            <p className="mt-1 text-sm text-slate-400">New products appear here after validation.</p>

            <div className="mt-5 space-y-4">
              {products.length === 0 ? (
                <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-white/15 bg-[#11101d] p-8 text-center">
                  <div>
                    <Gamepad2 className="mx-auto size-10 text-slate-600" aria-hidden="true" />
                    <p className="mt-4 font-semibold text-slate-300">No products yet</p>
                    <p className="mt-1 text-sm text-slate-500">Complete the form to add your first item.</p>
                  </div>
                </div>
              ) : (
                products.map((product) => (
                  <article key={product.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/60 via-[#151326] to-cyan-950/50 p-5 transition hover:-translate-y-1 hover:border-violet-400/40">
                    <div className="absolute -right-8 -top-8 size-28 rounded-full bg-violet-500/15 blur-2xl" />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-300">{product.tag}</span>
                        <span className="text-xs text-slate-400">{product.date}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold">{product.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{product.description}</p>
                      <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                        <div><p className="text-xs text-slate-500">Price</p><p className="font-bold text-fuchsia-300">฿{product.price.toLocaleString()}</p></div>
                        <div className="text-right"><p className="text-xs text-slate-500">In stock</p><p className="font-bold">{product.quantity}</p></div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
