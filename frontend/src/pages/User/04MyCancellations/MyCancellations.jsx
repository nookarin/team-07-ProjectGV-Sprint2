import { RotateCcw } from "lucide-react";
import AccountSidebar from "../AccountSidebar";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { useEffect, useState } from "react";
import { Ring } from "#components/ring";

const cancellations = [
  {
    id: "GV-240502",
    product: "Pulsefire Gaming Mouse",
    requested: "22 Jul 2026",
    amount: "฿1,290",
    reason: "Changed my mind",
    status: "Refunded",
  },
  {
    id: "GV-240399",
    product: "Titan XL Mouse Pad",
    requested: "08 Jul 2026",
    amount: "฿790",
    reason: "Item arrived damaged",
    status: "Return approved",
  },
  {
    id: "GV-240188",
    product: "Arc USB Microphone",
    requested: "16 Jun 2026",
    amount: "฿2,190",
    reason: "Ordered by mistake",
    status: "Cancelled",
  },
];

export default function MyCancellations() {
  const { url, user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(null);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/orders/user/${user._id}`, {
        withCredentials: true,
      });
      const cancelledOrders = response.data.orders.filter(
        (item) => item.payment_status === "cancelled",
      );
      console.log(cancelledOrders);
      setData(cancelledOrders);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[60px]">
        <AccountSidebar active="/my-cancellations" />
        <section aria-labelledby="cancellations-heading">
          <h1 id="cancellations-heading" className="mb-5 text-base font-bold">
            My Cancellations &amp; Returns
          </h1>
          <div className="space-y-4">
            {!loading ? (
              data.map((item) => (
                <article
                  key={item._id}
                  className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5"
                >
                  <div className="flex items-start gap-4">
                    <RotateCcw className="mt-1 size-5 shrink-0 text-[#F472B6]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <p className="text-xs text-[#8B86A5]">
                            Order #{item.order_number}
                          </p>
                          <ul className="text-xs list-disc list-inside mt-2 flex flex-col gap-2">
                            {item.items.map((i) => {
                              return (
                                <li key={i._id}>{i.product_id.product_name}</li>
                              );
                            })}
                          </ul>
                        </div>
                        <span className="inline-flex max-h-10 items-center justify-center rounded-full bg-[#3B213E] px-3 py-1 text-center text-xs font-semibold leading-none text-[#F9A8D4]">
                          {item.status}
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-2 border-t border-[#2A2A45] pt-3 text-xs sm:grid-cols-3">
                        <div>
                          <dt className="text-[#77728E]">Requested</dt>
                          <dd className="mt-1">{item.updatedAt}</dd>
                        </div>
                        {/* <div>
                        <dt className="text-[#77728E]">Reason</dt>
                        <dd className="mt-1">{item.reason}</dd>
                      </div> */}
                        <div>
                          <dt className="text-[#77728E]">Amount</dt>
                          <dd className="mt-1 font-bold text-[#F9A8D4]">
                            ฿{item.subtotal_price}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <Ring />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
