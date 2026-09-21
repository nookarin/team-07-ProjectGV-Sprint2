import { useMemo, useState } from "react";
import { Pencil, RotateCcw, Search, Trash2 } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Sort: Newest first" },
  { value: "oldest", label: "Sort: Oldest first" },
  { value: "name-asc", label: "Sort: Name (A–Z)" },
  { value: "name-desc", label: "Sort: Name (Z–A)" },
  { value: "price-asc", label: "Sort: Price (low to high)" },
  { value: "price-desc", label: "Sort: Price (high to low)" },
  { value: "stock-asc", label: "Sort: Stock (low to high)" },
  { value: "stock-desc", label: "Sort: Stock (high to low)" },
];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Palette used by the "Available Tags" panel. Every category gets one colour
// (cycle through the list) so tags can be told apart at a glance.
const TAG_COLORS = [
  {
    dot: "bg-violet-400",
    idle: "border-violet-400/30 bg-violet-500/10 text-violet-300 hover:border-violet-400/60 hover:bg-violet-500/20",
    active: "border-violet-400 bg-violet-500/30 text-violet-100",
  },
  {
    dot: "bg-cyan-400",
    idle: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/20",
    active: "border-cyan-400 bg-cyan-500/30 text-cyan-100",
  },
  {
    dot: "bg-emerald-400",
    idle: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-500/20",
    active: "border-emerald-400 bg-emerald-500/30 text-emerald-100",
  },
  {
    dot: "bg-amber-400",
    idle: "border-amber-400/30 bg-amber-500/10 text-amber-300 hover:border-amber-400/60 hover:bg-amber-500/20",
    active: "border-amber-400 bg-amber-500/30 text-amber-100",
  },
  {
    dot: "bg-rose-400",
    idle: "border-rose-400/30 bg-rose-500/10 text-rose-300 hover:border-rose-400/60 hover:bg-rose-500/20",
    active: "border-rose-400 bg-rose-500/30 text-rose-100",
  },
];

export default function ProductTable({ products, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  // Tags selected in the "Available Tags" panel. Empty set = no tag filter.
  const [activeTags, setActiveTags] = useState(() => new Set());

  const categories = useMemo(
    () =>
      ["All", ...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  );

  // Collect every tag grouped by its product's category. Categories are sorted
  // alphabetically so their assigned colours stay stable between renders.
  const tagsByCategory = useMemo(() => {
    const byCategory = new Map();
    products.forEach((product) => {
      product.tags.forEach((tag) => {
        if (!byCategory.has(product.category)) {
          byCategory.set(product.category, new Set());
        }
        byCategory.get(product.category).add(tag);
      });
    });
    return [...byCategory.entries()]
      .sort(([first], [second]) => String(first).localeCompare(String(second)))
      .map(([categoryName, tags]) => ({
        category: categoryName,
        tags: [...tags].sort(),
      }));
  }, [products]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = products.filter((product) => {
      const matchQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.description || "").toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchCategory =
        category === "All" || product.category === category;
      // Keep only products that have at least one of the selected tags.
      const matchTags =
        activeTags.size === 0 ||
        product.tags.some((tag) => activeTags.has(tag));
      return matchQuery && matchCategory && matchTags;
    });

    switch (sort) {
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "stock-asc":
        list.sort((a, b) => a.quantity - b.quantity);
        break;
      case "stock-desc":
        list.sort((a, b) => b.quantity - a.quantity);
        break;
      case "oldest":
        list.sort((a, b) =>
          String(a.createdAt).localeCompare(String(b.createdAt)),
        );
        break;
      default:
        list.sort((a, b) =>
          String(b.createdAt).localeCompare(String(a.createdAt)),
        );
    }
    return list;
  }, [products, search, category, sort, activeTags]);

  const hasActiveFilters =
    search.trim() || category !== "All" || sort !== "newest" || activeTags.size > 0;

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setSort("newest");
    setActiveTags(new Set());
  }

  // Toggle a tag on/off in the "Available Tags" filter.
  function toggleTag(tag) {
    setActiveTags((current) => {
      const next = new Set(current);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, description or tag..."
            className="w-full rounded-xl border border-white/10 bg-[#090813] py-2.5 pr-3 pl-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#090813] px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
            aria-label="Filter by category"
          >
            {categories.map((name) => (
              <option key={name} value={name}>
                {name === "All" ? "All categories" : name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#090813] px-3 py-2.5 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tagsByCategory.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#11101d] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-200">Available Tags</p>
            {activeTags.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveTags(new Set())}
                className="text-xs font-semibold text-violet-300 transition hover:text-violet-200"
              >
                Clear ({activeTags.size})
              </button>
            )}
          </div>
          <div className="mt-3 space-y-3">
            {tagsByCategory.map((group, index) => {
              const color = TAG_COLORS[index % TAG_COLORS.length];
              return (
                <div
                  key={group.category}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="flex min-w-24 items-center gap-1.5 text-xs font-medium text-slate-400">
                    <span className={`size-2 rounded-full ${color.dot}`} />
                    {group.category || "Uncategorized"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map((tag) => {
                      const active = activeTags.has(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          aria-pressed={active}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            active ? color.active : color.idle
                          }`}
                        >
                          {active ? "✓ " : "+ "}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-400">
          <span className="font-bold text-white">{visible.length}</span> of{" "}
          {products.length} products
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 transition hover:text-violet-200"
          >
            <RotateCcw className="size-3.5" />
            Reset filters
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-white/15 bg-[#11101d] p-8 text-center">
          <div>
            <p className="font-semibold text-slate-300">No products found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search, filters or sort.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-[34rem] overflow-auto rounded-3xl border border-white/10 bg-[#11101d]">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="sticky top-0 bg-[#171529] text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Added</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visible.map((product) => (
                <tr key={product.id} className="transition hover:bg-violet-500/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {(product.images?.[0] || product.image_url) && (
                        <img
                          src={product.images?.[0] || product.image_url}
                          alt=""
                          className="size-11 shrink-0 rounded-lg border border-white/10 object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{product.name}</p>
                        {product.tags.length > 0 && (
                          <p className="truncate text-xs text-slate-500">
                            {product.tags.slice(0, 2).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                      {product.category || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-fuchsia-300">
                    ฿{product.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.quantity > 0
                          ? "text-emerald-300"
                          : "font-semibold text-rose-400"
                      }
                    >
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {formatDate(product.createdAt || product.date || product.id)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="grid size-8 place-items-center rounded-lg border border-violet-400/30 bg-violet-500/10 text-violet-300 transition hover:border-violet-400/60 hover:bg-violet-500/20"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="grid size-8 place-items-center rounded-lg border border-rose-400/30 bg-rose-500/10 text-rose-300 transition hover:border-rose-400/60 hover:bg-rose-500/20"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}