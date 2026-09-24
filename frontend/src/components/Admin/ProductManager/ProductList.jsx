import { useState } from "react";
import { ChevronDown, ChevronUp, Gamepad2 } from "lucide-react";

export default function ProductList({
  products,
  loading,
  loadError,
  visibleCount = 1,
}) {
  // change visible entry that is not hiding
  const [showAll, setShowAll] = useState(false);
  const visibleProducts = showAll ? products : products.slice(0, visibleCount);
  const hasMore = products.length > visibleCount;
  return (
    <aside>
      <h2 className="text-xl font-bold">Recently added</h2>
      <p className="mt-1 text-sm text-slate-400">
        New products appear here after validation.
      </p>

      <div className="mt-5 space-y-4">
        {loadError && (
          <p
            className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
            role="alert"
          >
            {loadError}
          </p>
        )}

        {loading ? (
          <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-white/15 bg-[#11101d] p-8 text-center">
            <div>
              <Gamepad2
                className="mx-auto size-10 animate-pulse text-slate-600"
                aria-hidden="true"
              />
              <p className="mt-4 font-semibold text-slate-300">
                Loading products...
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Fetching from MongoDB.
              </p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-white/15 bg-[#11101d] p-8 text-center">
            <div>
              <Gamepad2
                className="mx-auto size-10 text-slate-600"
                aria-hidden="true"
              />
              <p className="mt-4 font-semibold text-slate-300">
                No products yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Complete the form to add your first item.
              </p>
            </div>
          </div>
        ) : (
          <>
            {visibleProducts.slice(0, 3).map((product) => (
              <article
                key={product.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/60 via-[#151326] to-cyan-950/50 p-5 transition hover:-translate-y-1 hover:border-violet-400/40"
              >
                <div className="absolute -right-8 -top-8 size-28 rounded-full bg-violet-500/15 blur-2xl" />
                <div className="relative">
                  {(product.images?.[0] || product?.image_url) && (
                    <div className="relative mb-4">
                      <img
                        src={product.images?.[0] || product.image_url}
                        alt={product.name}
                        className="h-44 w-full rounded-2xl border border-white/10 object-cover"
                      />
                      {product.images && product.images.length > 1 && (
                        <span className="absolute right-2 bottom-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
                          +{product.images.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      {product.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {product.date}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-0.5 text-xs text-violet-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{product.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                    {product.description}
                  </p>
                  <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-xs text-slate-500">Price</p>
                      <p className="font-bold text-fuchsia-300">
                        ฿{product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">In stock</p>
                      <p className="font-bold">{product.quantity}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-400/50 hover:bg-violet-500/20"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="size-4" aria-hidden="true" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4" aria-hidden="true" />
                    Show more ({products.length - visibleCount} hidden)
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
