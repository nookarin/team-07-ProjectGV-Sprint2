import { Star } from "lucide-react";
import AccountSidebar from "../AccountSidebar";

const reviews = [
  { id: 1, product: "Nebula Pro Wireless Controller", rating: 5, date: "20 Aug 2026", comment: "Excellent build quality and very responsive controls." },
  { id: 2, product: "Aurora RGB Mechanical Keyboard", rating: 4, date: "15 Aug 2026", comment: "Great switches and lighting. The software could be simpler." },
  { id: 3, product: "Phantom 7.1 Gaming Headset", rating: 5, date: "02 Aug 2026", comment: "Comfortable for long sessions with clear directional audio." },
];

export default function MyReviews() {
  return (
    <main className="min-h-screen bg-black px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[60px]">
        <AccountSidebar active="/my-reviews" />
        <section aria-labelledby="reviews-heading">
          <h1 id="reviews-heading" className="mb-5 text-base font-bold">My Reviews</h1>
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5">
                <div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold text-white">{review.product}</h2><time className="text-xs text-[#8B86A5]">{review.date}</time></div>
                <div className="mt-2 flex" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-4 ${index < review.rating ? "fill-[#FACC15] text-[#FACC15]" : "text-[#4B4865]"}`} />)}
                </div>
                <p className="mt-3 text-sm leading-6 text-[#AAA4C4]">{review.comment}</p>
                <button type="button" className="mt-3 text-xs font-semibold text-[#22D3EE] hover:text-[#A5F3FC]">Edit Review</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
