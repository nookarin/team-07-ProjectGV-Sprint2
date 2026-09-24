import { useEffect, useMemo, useState } from "react";
import { Star, Trash2, PencilLine } from "lucide-react";
import AccountSidebar from "../AccountSidebar";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

const API_URL = import.meta.env.VITE_API_URL;
const PRODUCTS_URL = import.meta.env.VITE_API_URL;

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fromDoc(doc) {
  return {
    id: doc._id,
    product: doc.product_id?.product_name ?? "Unknown Product",
    productId: doc.product_id?._id,
    rating: doc.rating,
    date: formatDate(doc.createdAt),
    comment: doc.comment ?? "",
  };
}

function Stars({ value, onChange, readonly }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <button
          key={index}
          type="button"
          disabled={Boolean(readonly)}
          onClick={() => onChange?.(index + 1)}
          className={readonly ? "" : "cursor-pointer"}
        >
          <Star
            className={`size-4 ${index < value ? "fill-[#FACC15] text-[#FACC15]" : "text-[#4B4865]"}`}
          />
        </button>
      ))}
    </span>
  );
}

export default function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: "", rating: 0, comment: "" });
  const [creating, setCreating] = useState(false);

  const loadReviews = useMemo(
    () => async (id) => {
      const res = await fetch(`${API_URL}/reviews?userId=${id}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to load reviews");
      return (result.data ?? []).map(fromDoc);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const id = user?._id || null;
        if (cancelled) return;
        if (!id) {
          setError("No user found. Please log in, then reload.");
          return;
        }

        const [reviewList, productList] = await Promise.all([
          loadReviews(id),
          fetch(`${PRODUCTS_URL}/products`).then((res) => res.json()),
        ]);

        if (cancelled) return;
        setReviews(reviewList);
        setProducts((productList.data ?? []).map((p) => ({ id: p._id, name: p.product_name })));
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [loadReviews, user]);

  function startEdit(review) {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  }

  async function saveEdit(reviewId) {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update review");

      setReviews((current) =>
        current.map((r) =>
          r.id === reviewId ? { ...r, rating: editRating, comment: editComment } : r,
        ),
      );
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteReview(reviewId) {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/reviews/${reviewId}`, { method: "DELETE", credentials: "include" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete review");
      setReviews((current) => current.filter((r) => r.id !== reviewId));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function createReview(event) {
    event.preventDefault();
    if (!form.productId || !form.rating) {
      setError("Pick a product and a rating.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: form.productId,
          rating: form.rating,
          comment: form.comment,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create review");

      const productName = products.find((p) => p.id === form.productId)?.name ?? "Unknown Product";
      setReviews((current) => [
        {
          id: result.data._id,
          product: productName,
          productId: form.productId,
          rating: form.rating,
          comment: form.comment,
          date: formatDate(result.data.createdAt),
        },
        ...current,
      ]);
      setForm({ productId: "", rating: 0, comment: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      {/* Show full-screen LoadingScreen while the reviews API request is being fetched */}
      {loading && <LoadingScreen />}
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[60px]">
        <AccountSidebar active="/my-reviews" />
        <section aria-labelledby="reviews-heading">
          <div className="mb-5 flex items-center justify-between">
            <h1 id="reviews-heading" className="text-base font-bold">My Reviews</h1>
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="rounded-lg bg-[#22D3EE] px-3 py-1.5 text-xs font-bold text-[#090813] transition-colors hover:bg-[#A5F3FC]"
            >
              {showForm ? "Cancel" : "+ Write a Review"}
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}

          {showForm && (
            <form onSubmit={createReview} className="mb-6 rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5">
              <h2 className="mb-4 font-bold text-white">Write a Review</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="review-product" className="mb-1 block text-xs font-semibold text-[#8B86A5]">Product</label>
                  <select
                    id="review-product"
                    value={form.productId}
                    onChange={(e) => setForm((current) => ({ ...current, productId: e.target.value }))}
                    className="w-full rounded-lg border border-[#2A2A45] bg-[#090813] px-3 py-2 text-sm text-white outline-none focus:border-[#22D3EE]"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold text-[#8B86A5]">Rating</span>
                  <Stars value={form.rating} onChange={(value) => setForm((current) => ({ ...current, rating: value }))} />
                </div>
                <div>
                  <label htmlFor="review-comment" className="mb-1 block text-xs font-semibold text-[#8B86A5]">Comment</label>
                  <textarea
                    id="review-comment"
                    value={form.comment}
                    onChange={(e) => setForm((current) => ({ ...current, comment: e.target.value }))}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-[#2A2A45] bg-[#090813] px-3 py-2 text-sm text-white outline-none focus:border-[#22D3EE]"
                    placeholder="Share your experience..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-[#22D3EE] px-4 py-2 text-xs font-bold text-[#090813] transition-colors hover:bg-[#A5F3FC] disabled:opacity-60"
                >
                  {creating ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5 text-sm text-[#8B86A5]">
              Loading your reviews...
            </p>
          ) : reviews.length === 0 ? (
            <p className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5 text-sm text-[#8B86A5]">
              No reviews yet. Write your first one to connect it to the database.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5">
                  {editingId === review.id ? (
                    <div className="space-y-3">
                      <Stars value={editRating} onChange={setEditRating} />
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={2}
                        className="w-full resize-y rounded-lg border border-[#2A2A45] bg-[#090813] px-3 py-2 text-sm text-white outline-none focus:border-[#22D3EE]"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(review.id)}
                          disabled={saving}
                          className="rounded-lg bg-[#22D3EE] px-3 py-1.5 text-xs font-bold text-[#090813] hover:bg-[#A5F3FC] disabled:opacity-60"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-[#2A2A45] px-3 py-1.5 text-xs font-semibold text-[#8B86A5] hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap justify-between gap-2">
                        <h2 className="font-bold text-white">{review.product}</h2>
                        <time className="text-xs text-[#8B86A5]">{review.date}</time>
                      </div>
                      <div className="mt-2">
                        <Stars value={review.rating} readonly />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#AAA4C4]">{review.comment}</p>
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(review)}
                          className="flex items-center gap-1 text-xs font-semibold text-[#22D3EE] hover:text-[#A5F3FC]"
                        >
                          <PencilLine className="size-3.5" /> Edit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteReview(review.id)}
                          disabled={saving}
                          className="flex items-center gap-1 text-xs font-semibold text-[#F9A8D4] hover:text-[#F472B6] disabled:opacity-60"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}