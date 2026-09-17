import { useState } from "react";
import { CalendarDays, CircleDollarSign, PackagePlus, Tag } from "lucide-react";
import {
  DEFAULT_CATEGORIES,
  fromDoc,
  initialProductForm,
  toPayload,
  validateProduct,
} from "./productFormUtils";
import { useAuth } from "@/contexts/Authentication/AuthContext";

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-rose-400" role="alert">
      {message}
    </p>
  );
}

export default function ProductForm({
  onProductAdded,
  categories = DEFAULT_CATEGORIES,
}) {
  const [form, setForm] = useState(initialProductForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { url } = useAuth();
  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
    setSubmitError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProduct(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${url}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });
      const result = await res.json();
      console.log(result)
      if (!res.ok) throw new Error(result.message || "Failed to add product");

      const product = fromDoc(result.data);
      setForm(initialProductForm);
      setErrors({});
      setSuccessMessage(`${product.name} was added successfully.`);
      onProductAdded?.(product);
    } catch (error) {
      setSubmitError(error.message);
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass = (field) =>
    `mt-2 w-full rounded-xl border bg-[#11101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/30 ${
      errors[field]
        ? "border-rose-500 focus:border-rose-400"
        : "border-white/10 focus:border-violet-400"
    }`;

  return (
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

      <form
        className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="sm:col-span-2">
          <label htmlFor="name" className="text-sm font-semibold text-slate-200">
            Product name
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={updateField}
            className={fieldClass("name")}
            placeholder="e.g. Nova Pro Controller"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          <FieldError id="name-error" message={errors.name} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="text-sm font-semibold text-slate-200">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={updateField}
            className={`${fieldClass("description")} min-h-52 resize-y`}
            placeholder="Describe features, compatibility, and highlights"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : undefined}
          />
          <FieldError id="description-error" message={errors.description} />
        </div>

        <div>
          <label htmlFor="price" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <CircleDollarSign className="size-4 text-violet-300" />
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={updateField}
            className={fieldClass("price")}
            placeholder="0.00"
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? "price-error" : undefined}
          />
          <FieldError id="price-error" message={errors.price} />
        </div>

        <div>
          <label htmlFor="quantity" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <PackagePlus className="size-4 text-violet-300" />
            Quantity
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            value={form.quantity}
            onChange={updateField}
            className={fieldClass("quantity")}
            placeholder="1"
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? "quantity-error" : undefined}
          />
          <FieldError id="quantity-error" message={errors.quantity} />
        </div>

        {/* <div>
          <label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <CalendarDays className="size-4 text-violet-300" />
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={updateField}
            className={`${fieldClass("date")} [color-scheme:dark]`}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? "date-error" : undefined}
          />
          <FieldError id="date-error" message={errors.date} />
        </div> */}

        <div>
          <label htmlFor="category" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Tag className="size-4 text-violet-300" />
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={updateField}
            className={fieldClass("category")}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "category-error" : undefined}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <FieldError id="category-error" message={errors.category} />
        </div>

        <div>
          <label htmlFor="tags" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Tag className="size-4 text-violet-300" />
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            value={form.tags}
            onChange={updateField}
            className={fieldClass("tags")}
            placeholder="e.g. RGB, Wireless, Red"
            aria-invalid={Boolean(errors.tags)}
            aria-describedby={errors.tags ? "tags-error" : undefined}
          />
          <p className="mt-1.5 text-xs text-slate-500">Separate tags with commas (,)</p>
          <FieldError id="tags-error" message={errors.tags} />
        </div>

        <div className="sm:col-span-2">
          {submitError && (
            <p
              className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
              role="alert"
            >
              {submitError}
            </p>
          )}
          {successMessage && (
            <p
              className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
              role="status"
            >
              {successMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 font-bold transition hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#11101d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PackagePlus className="size-5" aria-hidden="true" />
            {isSubmitting ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </section>
  );
}