import { RotateCcw } from "lucide-react";
import AccountSidebar from "../AccountSidebar";

const cancellations = [
  { id: "GV-240502", product: "Pulsefire Gaming Mouse", requested: "22 Jul 2026", amount: "฿1,290", reason: "Changed my mind", status: "Refunded" },
  { id: "GV-240399", product: "Titan XL Mouse Pad", requested: "08 Jul 2026", amount: "฿790", reason: "Item arrived damaged", status: "Return approved" },
  { id: "GV-240188", product: "Arc USB Microphone", requested: "16 Jun 2026", amount: "฿2,190", reason: "Ordered by mistake", status: "Cancelled" },
];

export default function MyCancellations() {
  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[60px]">
        <AccountSidebar active="/my-cancellations" />
        <section aria-labelledby="cancellations-heading">
          <h1 id="cancellations-heading" className="mb-5 text-base font-bold">My Cancellations &amp; Returns</h1>
          <div className="space-y-4">
            {cancellations.map((item) => (
              <article key={item.id} className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5">
                <div className="flex items-start gap-4">
                  <RotateCcw className="mt-1 size-5 shrink-0 text-[#F472B6]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap justify-between gap-2"><div><p className="text-xs text-[#8B86A5]">Order #{item.id}</p><h2 className="mt-1 font-bold text-white">{item.product}</h2></div><span className="inline-flex min-h-7 items-center justify-center rounded-full bg-[#3B213E] px-3 py-1 text-center text-xs font-semibold leading-none text-[#F9A8D4]">{item.status}</span></div>
                    <dl className="mt-4 grid gap-2 border-t border-[#2A2A45] pt-3 text-xs sm:grid-cols-3"><div><dt className="text-[#77728E]">Requested</dt><dd className="mt-1">{item.requested}</dd></div><div><dt className="text-[#77728E]">Reason</dt><dd className="mt-1">{item.reason}</dd></div><div><dt className="text-[#77728E]">Amount</dt><dd className="mt-1 font-bold text-[#F9A8D4]">{item.amount}</dd></div></dl>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
