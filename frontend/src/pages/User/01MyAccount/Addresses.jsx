import { MapPin } from "lucide-react";
import AccountSidebar from "../AccountSidebar";

const addresses = [
  {
    id: 1,
    label: "Home",
    recipient: "John Doe",
    phone: "099-546-3219",
    address: "123 Sukhumvit Road, Khlong Toei, Bangkok 10110",
    isDefault: true,
  },
  {
    id: 2,
    label: "Office",
    recipient: "John Doe",
    phone: "099-546-3219",
    address: "456 Silom Road, Bang Rak, Bangkok 10500",
    isDefault: false,
  },
  {
    id: 3,
    label: "Other",
    recipient: "John Doe",
    phone: "099-546-3219",
    address: "789 Nimmanahaeminda Road, Suthep, Chiang Mai 50200",
    isDefault: false,
  },
];

export default function () {
  return (
    <main className="min-h-screen bg-black px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[60px]">
        <AccountSidebar active="/edit-profiles/addresses" />

        <section id="addresses" aria-labelledby="addresses-heading">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h1 id="addresses-heading" className="text-base font-bold">
              My Addresses
            </h1>
            <button
              type="button"
              className="rounded-lg bg-[#8B5CF6] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#A78BFA]"
            >
              Add New Address
            </button>
          </div>

          <div className="space-y-4">
            {addresses.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <MapPin
                      className="mt-0.5 size-5 shrink-0 text-[#A78BFA]"
                      strokeWidth={1.8}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-white">{item.label}</h2>
                        {item.isDefault && (
                          <span className="rounded border border-[#EC4899] px-2 py-0.5 text-[10px] font-semibold text-[#F9A8D4]">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[13px] font-semibold">
                        {item.recipient} <span className="text-[#6B6B86]">|</span>{" "}
                        {item.phone}
                      </p>
                      <p className="mt-1 max-w-xl text-[13px] leading-5 text-[#AAA4C4]">
                        {item.address}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-[#22D3EE] transition-colors hover:text-[#A5F3FC]"
                  >
                    Edit
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
