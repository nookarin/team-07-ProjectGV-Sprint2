import { useEffect, useState } from "react";
import {
  CircleDollarSign,
  ImagePlus,
  PackagePlus,
  Tag,
  X,
} from "lucide-react";
import {
  DEFAULT_CATEGORIES,
  fromDoc,
  initialProductForm,
  toPayload,
  validateProduct,
} from "./productFormUtils";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { readJson } from "@/lib/api";

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
  onProductUpdated,
  onCancelEdit,
  editingProduct = null,
  categories = DEFAULT_CATEGORIES,
}) {
  const isEdit = Boolean(editingProduct);
  const [form, setForm] = useState(() =>
    editingProduct
      ? {
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          quantity: editingProduct.quantity,
          date: editingProduct.date,
          category: editingProduct.category,
          tags: (editingProduct.tags ?? []).join(", "),
        }
      : initialProductForm,
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [serverCategories, setServerCategories] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [files, setFiles] = useState([]);
  const { url } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const res = await fetch(`${url}/categories`);
        const result = await readJson(res);
        if (res.ok && Array.isArray(result.categories)) {
          if (!cancelled) setServerCategories(result.categories);
        }
      } catch {
        // Categories stay empty; validation surfaces a helpful error
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    let cancelled = false;

    async function loadSuggestedTags() {
      const selected = serverCategories.find(
        (current) => current.category_name === form.category,
      );
      if (!selected) {
        if (!cancelled) setSuggestedTags([]);
        return;
      }

      try {
        const res = await fetch(
          `${url}/subcategories?category_id=${selected._id}`,
        );
        const result = await readJson(res);
        if (res.ok && Array.isArray(result.subcategories)) {
          if (!cancelled)
            setSuggestedTags(
              result.subcategories.map((sub) => sub.subcategory_name),
            );
        } else if (!cancelled) {
          setSuggestedTags([]);
        }
      } catch {
        if (!cancelled) setSuggestedTags([]);
      }
    }

    loadSuggestedTags();
    return () => {
      cancelled = true;
    };
  }, [url, form.category, serverCategories]);

  function toggleSuggestedTag(tag) {
    const current = form.tags
      ? form.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const isPresent = current.some(
      (item) => item.toLowerCase() === tag.toLowerCase(),
    );
    const next = isPresent
      ? current.filter((item) => item.toLowerCase() !== tag.toLowerCase())
      : [...current, tag];

    setForm((currentForm) => ({ ...currentForm, tags: next.join(", ") }));
    setSubmitError("");
    setSuccessMessage("");
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
    setSubmitError("");
    setSuccessMessage("");
  }

  function handleFilesChange(event) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;
    const added = selected.map((item) => ({
      id: `${item.name}-${item.size}-${Date.now()}-${Math.random()}`,
      file: item,
      preview: URL.createObjectURL(item),
    }));
    setFiles((current) => [...current, ...added]);
    setSubmitError("");
    setSuccessMessage("");
    event.target.value = "";
  }

  function removeFile(index) {
    setFiles((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  }

  function clearFiles() {
    setFiles((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.preview));
      return [];
    });
  }

  async function attachImages(productId) {
    const formData = new FormData();
    files.forEach((item) => formData.append("images", item.file));
    const res = await fetch(`${url}/products/${productId}/images`, {
      method: "POST",
      body: formData,
    });
    const result = await readJson(res);
    if (!res.ok) throw new Error(result.message || "Failed to upload images");
    return result;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const values = form.date
      ? form
      : { ...form, date: new Date().toISOString().slice(0, 10) };
    const nextErrors = validateProduct(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSuccessMessage("");
      return;
    }

    const category = serverCategories.find(
      (current) => current.category_name === values.category,
    );
    if (!category) {
      setErrors((current) => ({
        ...current,
        category: "Please select a category available on the server",
      }));
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(
        isEdit ? `${url}/products/${editingProduct.id}` : `${url}/products`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(values, category._id)),
        },
      );
      const result = await readJson(res);
      if (!res.ok)
        throw new Error(
          result.message || (isEdit ? "Failed to update product" : "Failed to add product"),
        );

      let finalProduct = {
        ...fromDoc(isEdit ? result.data : result.product),
        category: values.category,
      };
      if (files.length > 0 && finalProduct.id) {
        const uploadResult = await attachImages(finalProduct.id);
        finalProduct = fromDoc(uploadResult.product);
      }

      clearFiles();
      if (isEdit) {
        setSuccessMessage(`${finalProduct.name} was updated successfully.`);
        onProductUpdated?.(finalProduct);
        if (onCancelEdit) {
          onCancelEdit();
          return;
        }
        setForm(initialProductForm);
      } else {
        setForm(initialProductForm);
        setErrors({});
        setSuccessMessage(`${finalProduct.name} was added successfully.`);
        onProductAdded?.(finalProduct);
      }
    } catch (error) {
      setSubmitError(error.message);
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryOptions =
    serverCategories.length > 0
      ? serverCategories.map(({ category_name }) => category_name).sort()
      : categories;

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
            <h2 className="text-xl font-bold">
              {isEdit ? "Edit product" : "Add a product"}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {isEdit
                ? `Editing "${editingProduct.name}".`
                : "All fields are required."}
            </p>
          </div>
          {isEdit && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="ml-auto flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400/40 hover:text-rose-300"
            >
              <X className="size-4" />
              Cancel
            </button>
          )}
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

        <div className="sm:col-span-2">
          <label
            htmlFor="product-images"
            className="flex items-center gap-2 text-sm font-semibold text-slate-200"
          >
            <ImagePlus className="size-4 text-violet-300" />
            Product images{" "}
            <span className="text-xs font-normal text-slate-500">(optional)</span>
          </label>
          <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {files.map((item, index) => (
              <div key={item.id} className="relative">
                <img
                  src={item.preview}
                  alt={`Product preview ${index + 1}`}
                  className="aspect-square w-full rounded-xl border border-white/10 object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-violet-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                    MAIN
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-rose-500 text-white transition hover:bg-rose-400"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <label
              htmlFor="product-images"
              className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-white/15 bg-[#090813] text-slate-500 transition hover:border-violet-400/40 hover:text-slate-300"
            >
              <div className="flex flex-col items-center gap-1">
                <ImagePlus className="size-6" />
                <span className="text-xs">Add image</span>
              </div>
            </label>
          </div>
          <input
            id="product-images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="hidden"
          />
          <p className="mt-2 text-xs text-slate-500">
            JPG, PNG or WEBP up to 5&nbsp;MB each (max 10). The first image is
            the main product picture.
          </p>
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
            Stock
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
            {categoryOptions.map((category) => (
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
          {suggestedTags.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-400">
                Suggested tags for this category
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedTags.map((tag) => {
                  const active = form.tags
                    .split(",")
                    .map((item) => item.trim().toLowerCase())
                    .includes(tag.toLowerCase());

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleSuggestedTag(tag)}
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        active
                          ? "border-violet-400 bg-violet-500/20 text-violet-200"
                          : "border-white/10 bg-[#090813] text-slate-300 hover:border-violet-400/40"
                      }`}
                    >
                      {active ? "✓ " : "+ "}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
                ? "Update Product"
                : "Add Product"}
          </button>
        </div>
      </form>
    </section>
  );
}