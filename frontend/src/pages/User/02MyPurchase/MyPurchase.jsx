import { PackageCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import AccountSidebar from "../AccountSidebar";
import { useOrder } from "@/contexts/Order/OrderProvider";

export default function MyPurchase() {
  // อ่านออเดอร์จาก Context ที่หน้าจ่ายเงินสั่ง refresh ได้หลังสถานะเปลี่ยน
  const { orders, loading, error } = useOrder();

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[60px]">
        <AccountSidebar active="/my-purchases" />
        <section aria-labelledby="purchases-heading">
          <h1 id="purchases-heading" className="mb-5 text-base font-bold">
            My Purchase
          </h1>
          <div className="space-y-5">
            {/* แยกกำลังโหลด/โหลดไม่สำเร็จ/ไม่มีออเดอร์ เพื่อไม่แสดงว่าไม่มีออเดอร์ตอนยังรอ API */}
            {loading && <p role="status">Loading orders…</p>}
            {error && <p role="alert" className="text-rose-300">{error}</p>}
            {!loading && !error && !orders.length && <p>No orders yet.</p>}
            {orders.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#141321] shadow-lg shadow-black/10 transition-colors hover:border-violet-400/30"
              >
                {/* Order header */}
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-white/[0.02] px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                      <PackageCheck className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#928CA8]">
                        Order number
                      </p>
                      <h2 className="mt-1 break-all text-sm font-semibold text-white">
                        #{order.order_number}
                      </h2>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-200">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-current"
                      aria-hidden="true"
                    />
                    {/* แสดงสถานะจัดส่งควบคู่กับ paid เพื่อแยกการรับเงินกับขั้นตอนส่งสินค้า */}
                    {order.payment_status === "paid" ? `${order.status} · paid` : order.status}
                  </span>
                </header>

                {/* Products */}
                <ul className="divide-y divide-white/5 px-5">
                  {order.items.map((item, index) => (
                    <li
                      key={item._id ?? `${item.product_id?._id}-${index}`}
                      className="flex items-center gap-4 py-5"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-[#201D30]">
                        {item.product_id?.images?.[0] ? (
                          <img
                            src={item.product_id.images[0]}
                            alt={item.product_id.product_name ?? "Product"}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PackageCheck
                            className="h-7 w-7 text-violet-300/40"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-medium leading-relaxed text-[#F0EDF8]">
                          {item.product_id?.product_name ??
                            "Product unavailable"}
                        </h3>

                        {/* ใช้ unit_price ที่เก็บตอนสั่งซื้อ ไม่ใช้ราคาปัจจุบันของ Product */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="text-sm tabular-nums text-[#B9B2CB]">
                            ฿
                            {Number(item.unit_price ?? 0).toLocaleString(
                              "th-TH",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </p>
                          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-[#A59CB8]">
                            Qty {item.quantity}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* ยอดรวมออเดอร์จาก backend รวมค่าส่งและส่วนลดที่ยืนยันตอนสั่งซื้อแล้ว */}
                <footer className="border-t border-white/5 bg-black/10 px-5 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-[#928CA8]">
                        Order total
                        <span className="mx-2 text-white/20">·</span>
                        {order.total_quantity} items
                      </p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-white tabular-nums">
                        ฿
                        {Number(order.total_price ?? 0).toLocaleString(
                          "th-TH",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </p>
                    </div>

                    {/* ออเดอร์ PromptPay เปิดหน้าจ่ายเดิมได้ ทั้งจ่ายต่อและดูสถานะหลังจ่าย */}
                    <Link
                      to={order.payment_method === "promptpay" ? `/payment/${order._id}` : `/my-purchases/${order._id}`}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-xs font-semibold text-violet-200 transition-colors hover:border-violet-400/40 hover:bg-violet-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141321] sm:w-auto"
                    >
                      {order.payment_method === "promptpay" && order.status === "pending" && order.payment_status !== "paid" ? "Pay with PromptPay" : "View Status"}
                      <ChevronRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>

                  {order.date && (
                    <p className="mt-3 text-[11px] text-[#928CA8]">
                      Ordered on {order.date}
                    </p>
                  )}
                </footer>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
