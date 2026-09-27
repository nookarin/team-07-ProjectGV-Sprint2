import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  QrCode,
  ShieldCheck,
  LoaderCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { useOrder } from "@/contexts/Order/OrderProvider";

// ราคา API เป็นบาท จัดรูปแบบ THB ได้โดยไม่ต้องหาร 100
const money = (amount) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(
    amount ?? 0,
  );

export default function PromptPayPage() {
  const { orderId } = useParams();
  const { url } = useAuth();
  const { refreshOrders } = useOrder();
  const [result, setResult] = useState(null);
  const [clock, setClock] = useState(Date.now);
  const [serverOffset, setServerOffset] = useState(0);
  const expiryRefresh = useRef(null);
  const receiveResult = useCallback((data) => {
    const receivedAt = Date.now();
    const serverTime = Date.parse(data.payment.server_time);
    setServerOffset(Number.isFinite(serverTime) ? serverTime - receivedAt : 0);
    setClock(receivedAt);
    setResult(data);
  }, []);
  const [error, setError] = useState("");
  // แยก error จากปุ่มกับ polling เพื่อไม่ให้การ polling ลบข้อความของการกดปุ่ม
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  // เพิ่ม revision เพื่อเริ่มตรวจสถานะรอบใหม่หลังสร้าง QR หรือยกเลิกออเดอร์
  const [revision, setRevision] = useState(0);
  const actionLock = useRef(false);
  const endpoint = `${url}/payments/promptpay/${orderId}`;
  // เปลี่ยน URL ไปอีกออเดอร์แล้วต้องไม่แสดงข้อมูลออเดอร์เก่าที่ค้างใน state
  const order = result?.order?._id === orderId ? result.order : null;
  const payment = order ? result.payment : null;
  const paid = order?.payment_status === "paid";
  const cancelled = order?.status === "cancelled";
  const expiresAt = Date.parse(payment?.expires_at);
  const remainingSeconds = Number.isFinite(expiresAt)
    ? Math.max(0, Math.ceil((expiresAt - clock - serverOffset) / 1000))
    : null;
  const timeExpired = remainingSeconds === 0 && !paid && !cancelled;
  const countdown = remainingSeconds === null ? null :
    `${Math.floor(remainingSeconds / 60).toString().padStart(2, "0")}:${(remainingSeconds % 60).toString().padStart(2, "0")}`;
  const failed =
    payment?.status === "requires_payment_method" && !!payment.error;
  // สร้างหรือลอง QR ใหม่เฉพาะสถานะที่ยังต้องเริ่ม/ยืนยันการจ่าย
  const needsQr =
    payment &&
    !paid &&
    !cancelled &&
    !timeExpired &&
    [
      "not_started",
      "requires_payment_method",
      "requires_confirmation",
    ].includes(payment.status);

  useEffect(() => {
    if (!Number.isFinite(expiresAt) || paid || cancelled) return;
    const timer = setInterval(() => setClock(Date.now()), 250);
    return () => clearInterval(timer);
  }, [expiresAt, paid, cancelled]);

  // เมื่อหมดเวลา ซ่อน QR ทันทีและขอสถานะจาก backend โดยไม่รอ polling รอบปกติ
  useEffect(() => {
    if (!Number.isFinite(expiresAt) || paid || cancelled) return;
    const key = `${orderId}:${expiresAt}`;
    if (expiryRefresh.current === key) return;
    const timer = setTimeout(() => {
      expiryRefresh.current = key;
      setClock(Date.now());
      setRevision((value) => value + 1);
    }, Math.max(0, expiresAt - Date.now() - serverOffset));
    return () => clearTimeout(timer);
  }, [orderId, expiresAt, serverOffset, paid, cancelled]);

  // polling เรียก backend ทุก 4 วินาที โดย backend ตรวจสถานะจริงจาก Stripe อีกที
  useEffect(() => {
    const controller = new AbortController();
    let timer;
    let failures = 0;
    async function poll() {
      let terminal;
      try {
        const { data } = await axios.get(endpoint, {
          withCredentials: true,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        receiveResult(data);
        setError("");
        failures = 0;
        terminal =
          data.order.payment_status === "paid" ||
          data.order.status === "cancelled";
        // paid/cancelled ถือว่าจบ และสั่งให้ My Purchase โหลดรายการล่าสุด
        if (terminal) refreshOrders();
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err.response?.data?.message ||
            "Connection interrupted. Retrying payment status…",
        );
        failures++;
        // หยุดเมื่อไม่มีสิทธิ์หรือไม่พบออเดอร์ ส่วนปัญหาเครือข่ายให้ลองใหม่
        terminal = [401, 403, 404].includes(err.response?.status);
      }
      if (!terminal && !controller.signal.aborted) {
        // ตั้งรอบใหม่หลังคำขอเดิมจบ เพิ่มเวลารอเมื่อผิดพลาด สูงสุด 20 วินาที
        timer = setTimeout(poll, Math.min(4000 * (failures + 1), 20000));
      }
    }
    poll();
    // ออกจากหน้าหรือเปลี่ยนออเดอร์แล้วหยุดทั้งคำขอและตัวตั้งเวลาของรอบเก่า
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [endpoint, revision, refreshOrders, receiveResult]);

  // จัดการปุ่มสร้าง QR/ยกเลิก และล็อกทันทีเพื่อป้องกันกดซ้ำระหว่างรอ API
  async function act(action) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    setActionError("");
    try {
      if (action === "cancel") {
        await axios.delete(`${url}/orders/${orderId}`, {
          withCredentials: true,
        });
      } else {
        const { data } = await axios.post(
          endpoint,
          {},
          { withCredentials: true },
        );
        receiveResult(data);
      }
      setRevision((value) => value + 1);
      refreshOrders();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to complete this action. Please try again.",
      );
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[80vh] px-4 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/my-purchases"
          className="mb-7 inline-flex items-center gap-2 text-sm text-violet-300 hover:text-white"
        >
          <ArrowLeft size={16} /> My purchases
        </Link>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs tracking-[0.25em] text-violet-300">
              GEARVERSE CHECKOUT
            </p>
            <h1 className="text-3xl font-bold">PromptPay</h1>
          </div>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold text-amber-200">
            TEST PAYMENT · THB
          </span>
        </div>
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
          >
            {error}
          </div>
        )}
        {actionError && !paid && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200"
          >
            {actionError}
          </div>
        )}
        {/* รอข้อมูลออเดอร์ก่อนเลือกแสดง QR ผลสำเร็จ หรือการยกเลิก */}
        {!order ? (
          <div
            role="status"
            className="rounded-2xl border border-white/10 bg-[#141321] p-10 text-center"
          >
            {error ? (
              <button
                onClick={() => setRevision((value) => value + 1)}
                className="text-violet-300 underline"
              >
                Try again
              </button>
            ) : (
              <>
                <LoaderCircle className="mx-auto mb-3 animate-spin" /> Loading
                your order…
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <section
              className="rounded-3xl border border-violet-400/20 bg-[#141321] p-6 text-center sm:p-8"
              aria-label="PromptPay payment"
            >
              <div aria-live="polite">
                {paid ? (
                  <>
                    <CheckCircle2 className="mx-auto mb-5 size-16 text-emerald-400" />
                    <h2 className="text-2xl font-bold">Payment successful</h2>
                    <p className="mt-3 text-sm text-slate-400">
                      Stripe confirmed your test payment. Your order is now
                      processing.
                    </p>
                  </>
                ) : cancelled ? (
                  <>
                    <h2 className="text-xl font-bold">Order cancelled</h2>
                    <p className="mt-3 text-sm text-slate-400">
                      {payment.expired
                        ? "The 10-minute payment window has expired. Please place a new order."
                        : "This payment is closed. You can place a new order from your cart."}
                    </p>
                  </>
                ) : timeExpired && payment.status !== "processing" ? (
                  <>
                    <h2 className="text-xl font-bold">Payment time expired</h2>
                    <p role="status" className="mt-3 text-sm text-slate-400">
                      The 10-minute payment window has ended. Confirming the final payment status…
                    </p>
                  </>
                ) : (
                  <>
                    <QrCode className="mx-auto mb-3 size-8 text-violet-300" />
                    <h2 className="text-xl font-semibold">
                      {payment.qr_image_url
                        ? "Your PromptPay QR"
                        : "Review your payment"}
                    </h2>
                    <p className="my-4 text-3xl font-bold tabular-nums">
                      {money(order.total_price)}
                    </p>
                    {countdown && payment.status !== "processing" && (
                      <p className="mb-4 text-sm text-amber-200">
                        Complete payment within{" "}
                        <span role="timer" className="font-semibold tabular-nums">{countdown}</span>
                      </p>
                    )}
                    {!countdown && !payment.qr_image_url && (
                      <p className="mb-4 text-sm text-slate-400">
                        You have 10 minutes to complete payment after generating your QR.
                      </p>
                    )}
                    {/* ใช้ภาพ QR ที่ backend รับจาก Stripe แสดงภายใน GearVerse */}
                    {payment.qr_image_url && !timeExpired && (
                      <div className="mx-auto mb-5 w-fit rounded-2xl bg-white p-4">
                        <img
                          src={payment.qr_image_url}
                          alt={`PromptPay test QR for ${order.order_number}`}
                          width="240"
                          height="240"
                          className="h-auto w-60 max-w-full"
                        />
                      </div>
                    )}
                    {failed && (
                      <p className="mb-4 text-sm text-rose-300">
                        Payment failed or the QR expired. Generate a new QR to
                        try again.
                      </p>
                    )}
                    {needsQr && (
                      <button
                        disabled={busy}
                        onClick={() => act("pay")}
                        className="w-full rounded-xl bg-violet-500 px-5 py-3 font-semibold text-white hover:bg-violet-400 disabled:opacity-50"
                      >
                        {busy
                          ? "Generating QR…"
                          : failed
                            ? "Try payment again"
                            : "Generate PromptPay QR"}
                      </button>
                    )}
                    {!needsQr && (
                      <p className="flex items-center justify-center gap-2 text-sm text-cyan-200">
                        <LoaderCircle size={16} className="animate-spin" />
                        Waiting for payment confirmation
                      </p>
                    )}
                    {/* <p className="mt-5 text-sm leading-relaxed text-slate-400">
                      This is a simulated payment. No real money is charged. Use
                      the Stripe test page or scan this QR with a regular QR
                      scanner to simulate the result.
                    </p> */}
                    {/* เปิดหน้าจำลองผลจ่ายของ Stripe ในแท็บใหม่ และรออัปเดตสถานะในหน้านี้ */}
                    {!timeExpired && (payment.test_payment_url || payment.instructions_url) && (
                      <a
                        href={
                          payment.test_payment_url || payment.instructions_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 underline"
                      >
                        {payment.test_payment_url
                          ? "Simulate payment on Stripe"
                          : "Open Stripe test instructions"}
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <p className="mt-3 text-xs text-slate-500">
                      Keep this page open. The status updates automatically.
                    </p>
                  </>
                )}
              </div>
              {(paid || cancelled) && (
                <Link
                  to="/my-purchases"
                  className="mt-7 inline-block rounded-xl bg-violet-500 px-6 py-3 font-semibold"
                >
                  Back to my purchases
                </Link>
              )}
            </section>
            {/* ใช้ยอดและที่อยู่ที่บันทึกในออเดอร์ ไม่คำนวณใหม่จากราคาสินค้าปัจจุบัน */}
            <aside className="space-y-5">
              <section className="rounded-3xl border border-white/10 bg-[#141321] p-6">
                <h2 className="mb-2 font-semibold">Order summary</h2>
                <p className="mb-6 break-all text-xs text-slate-400">
                  {order.order_number}
                </p>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">
                      Subtotal · {order.total_quantity} items
                    </dt>
                    <dd>{money(order.subtotal_price ?? order.total_price)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Shipping</dt>
                    <dd>{money(order.shipping_fee)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 text-emerald-300">
                    <dt>
                      Discount {order.promo_code && `(${order.promo_code})`}
                    </dt>
                    <dd>−{money(order.discount_amount)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-bold">
                    <dt>Total</dt>
                    <dd>{money(order.total_price)}</dd>
                  </div>
                </dl>
              </section>
              <section className="rounded-3xl border border-white/10 bg-[#141321] p-6 text-sm">
                <h2 className="mb-3 font-semibold">Deliver to</h2>
                <p>
                  {order.shipping_address.firstname}{" "}
                  {order.shipping_address.lastname}
                </p>
                <p className="mt-2 leading-relaxed text-slate-400">
                  {[
                    "houseNo",
                    "street",
                    "subdistrict",
                    "district",
                    "province",
                    "zipCode",
                  ]
                    .map((key) => order.shipping_address[key])
                    .filter(Boolean)
                    .join(" ")}
                </p>
                <p className="mt-2 text-slate-400">
                  {order.shipping_address.phoneNumber}
                </p>
              </section>
              <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={16} /> Payment verified by Stripe
              </p>
              {!paid && !cancelled && !timeExpired && payment.status !== "processing" && (
                <button
                  disabled={busy}
                  onClick={() => act("cancel")}
                  className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 hover:text-rose-300 disabled:opacity-50"
                >
                  Cancel this order
                </button>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
