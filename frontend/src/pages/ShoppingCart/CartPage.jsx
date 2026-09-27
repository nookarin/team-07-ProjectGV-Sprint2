import { useState, useEffect, useRef } from "react";
import {
  Truck,
  X,
  Check,
  ArrowRight,
  Lock,
  ShieldCheck,
  Headphones,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { useCart } from "@/contexts/Cart/CartProvider";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";
import { toast } from "sonner";
import { Ring } from "#components/ring";

export default function CartPage() {
  const { user, url } = useAuth();
  const { data, cartId, getCart, loading } = useCart();
  const navigate = useNavigate();
  // แยกโค้ดที่กำลังพิมพ์ออกจากโค้ดที่กด Apply แล้ว เพื่อไม่เรียกคำนวณยอดทุกตัวอักษร
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  // เก็บยอดที่ backend ตรวจแล้วคู่กับ key ของตะกร้า ป้องกันการใช้ยอดของข้อมูลชุดเก่า
  const [quoteState, setQuoteState] = useState(null);
  const [quoteError, setQuoteError] = useState("");
  const [busy, setBusy] = useState(false);
  // state แสดงจำนวนใหม่ทันที ส่วน ref เก็บค่าล่าสุดให้คลิกต่อเนื่องได้ก่อน React render
  const [quantities, setQuantities] = useState({});
  const pendingQuantities = useRef({});
  const hasPendingQuantities = Object.keys(quantities).length > 0;
  // ref ล็อกคำขอได้ทันที ส่วน busy ใช้แสดง/ปิดปุ่มระหว่างส่งข้อมูล
  const actionLock = useRef(false);
  const quoteKey = JSON.stringify([
    cartId,
    appliedCode,
    data.map((item) => [item._id, item.quantity, item.product_id?.price]),
  ]);
  // ใช้ยอดได้เมื่อไม่มีจำนวนค้างส่ง และ key ตรงกับตะกร้าปัจจุบันเท่านั้น
  const quote =
    !hasPendingQuantities && !busy && quoteState?.key === quoteKey
      ? quoteState.value
      : null;
  const totalPrice = quote?.subtotal_price ?? 0;
  const sumPrice = quote?.total_price ?? 0;
  const shipping = quote?.shipping_fee ?? 39;

  // โหลด subtotal/ส่วนลด/ค่าส่งใหม่เมื่อตะกร้าหรือโค้ดเปลี่ยน และบันทึกจำนวนเสร็จแล้ว
  useEffect(() => {
    if (!cartId || !data.length || hasPendingQuantities || busy) return;
    const controller = new AbortController();
    // แยก async ไว้ใน effect เพื่อให้ effect คืนฟังก์ชัน cleanup ได้ ไม่คืน Promise
    const fetchQuote = async () => {
      try {
        const { data: result } = await axios.post(
          `${url}/orders/quote`,
          { cart_id: cartId, promo_code: appliedCode },
          {
            withCredentials: true,
            signal: controller.signal,
          },
        );
        setQuoteState({ key: quoteKey, value: result.quote });
        setQuoteError("");
      } catch (error) {
        // การยกเลิก request เก่าจาก cleanup เป็นเหตุการณ์ปกติ ไม่ต้องแสดง error
        if (!axios.isCancel(error))
          setQuoteError(
            error.response?.data?.message ||
              "Unable to calculate your order total.",
          );
      }
    };
    fetchQuote();
    // ยกเลิกคำขอเดิมเมื่อ dependency เปลี่ยนหรือออกจากหน้า
    return () => controller.abort();
  }, [
    url,
    cartId,
    appliedCode,
    quoteKey,
    data.length,
    hasPendingQuantities,
    busy,
  ]);

  // รอหยุดกด 500 ms แล้วส่งจำนวนสุดท้ายของทุกสินค้าที่เปลี่ยน ไม่ใช่เฉพาะชิ้นที่กดล่าสุด
  const syncQuantity = useDebouncedCallback(async () => {
    const updates = Object.entries(pendingQuantities.current);
    if (!updates.length || actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    try {
      // ส่งทีละรายการ เพราะ backend บันทึกเอกสารตะกร้าเดียวกัน ลดการเขียนทับกันระหว่างคำขอ
      for (const [itemId, quantity] of updates) {
        try {
          await axios.patch(
            `${url}/shoppingcart/${user._id}/items/${itemId}`,
            { quantity },
            { withCredentials: true },
          );
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Unable to update quantity.",
            {
              richColors: true,
              duration: 5000,
              position: "top-center",
            },
          );
        }
      }
      // โหลดจำนวนที่บันทึกจริงกลับมา รวมกรณีบางรายการถูกปฏิเสธ เช่น สต็อกไม่พอ
      await getCart();
    } finally {
      // ล้างจำนวนชั่วคราวเพื่อกลับไปแสดงข้อมูล backend และให้ effect คำนวณยอดใหม่
      pendingQuantities.current = {};
      setQuantities({});
      actionLock.current = false;
      setBusy(false);
    }
  }, 500);

  // ออกจากหน้าก่อนครบ 500 ms ให้ยกเลิก callback ที่ยังไม่ได้เริ่มส่ง
  useEffect(() => () => syncQuantity.cancel(), [syncQuantity]);

  // ใช้ร่วมกับลบสินค้า/ล้างตะกร้า ป้องกันชนกับการบันทึกจำนวนหรือสร้างออเดอร์
  const mutateCart = async (action) => {
    if (actionLock.current || Object.keys(pendingQuantities.current).length)
      return;
    actionLock.current = true;
    setBusy(true);
    try {
      await action();
      await getCart();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update cart.", {
        richColors: true,
        duration: 5000,
        position: "top-center",
      });
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };
  const handleRemoveItem = (itemId) =>
    mutateCart(() =>
      axios.delete(`${url}/shoppingcart/${user._id}/items/${itemId}`, {
        withCredentials: true,
      }),
    );
  // เปลี่ยนตัวเลขทันที จำกัดต่ำสุดที่ 1 แล้วเลื่อนเวลาส่ง API ออกไปตาม debounce
  const handleQuantity = (itemId, type) => {
    if (actionLock.current) return;
    const current =
      pendingQuantities.current[itemId] ??
      data.find((item) => item._id === itemId)?.quantity ??
      1;
    const quantity = current + (type === "increase" ? 1 : -1);
    if (quantity < 1) return;
    pendingQuantities.current = {
      ...pendingQuantities.current,
      [itemId]: quantity,
    };
    setQuantities(pendingQuantities.current);
    // ยอดเก่าใช้ checkout ไม่ได้แล้ว เพราะจำนวนบนจอเปลี่ยนไป
    setQuoteState(null);
    syncQuantity();
  };
  // ให้ effect ส่งโค้ดไปตรวจที่ backend; frontend ไม่ตัดสินเองว่าโค้ดใช้ได้หรือไม่
  const handleApplyPromo = (e) => {
    e.preventDefault();
    // ไม่ส่งโค้ดว่างไปตรวจ ตามพฤติกรรมปุ่ม Apply ที่เพิ่มมาจาก main
    if (!promoCode.trim()) return;
    setQuoteError("");
    setAppliedCode(promoCode.trim().toLowerCase());
  };
  // รอจำนวนและยอดที่ยืนยันแล้ว ส่ง expected_total ให้ backend ตรวจว่ายอดเปลี่ยนหรือไม่
  const handleProceedToCheckout = async () => {
    if (
      actionLock.current ||
      Object.keys(pendingQuantities.current).length ||
      !quote ||
      !cartId
    )
      return;
    actionLock.current = true;
    setBusy(true);
    try {
      const { data: result } = await axios.post(
        `${url}/orders`,
        {
          cart_id: cartId,
          payment_method: "promptpay",
          promo_code: appliedCode,
          expected_total: quote.total_price,
        },
        { withCredentials: true },
      );
      // เปิดหน้าจ่ายภายใน GearVerse แล้วโหลดตะกร้าที่ถูก checkout ใหม่
      navigate(`/payment/${result.order._id}`);
      await getCart();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to create your order.",
        {
          richColors: true,
          duration: 5000,
          position: "top-center",
        },
      );
      await getCart();
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] relative z-10 text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-12 font-sans antialiased">
      {/* Show full-screen LoadingScreen while the cart API request is being fetched */}
      {/* {loading && <LoadingScreen />} */}
      <div className="max-w-7xl mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items & Info (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Shopping Cart
                </h1>
                <Badge className="bg-[#1e1a33] mt-2 text-slate-300 hover:bg-[#282345] font-semibold text-xs px-3 py-1 rounded-md border border-[#2f294d]/60">
                  {data.length} {data.length === 1 ? "item" : "items"}
                </Badge>
              </div>

              {data?.length > 0 && (
                <Button
                  variant="link"
                  disabled={busy || hasPendingQuantities}
                  onClick={() =>
                    mutateCart(() =>
                      axios.delete(`${url}/shoppingcart/${user._id}`, {
                        withCredentials: true,
                      }),
                    )
                  }
                  className="text-slate-400 hover:text-rose-400 text-sm font-medium underline underline-offset-4 p-0 h-auto cursor-pointer"
                >
                  Clear All Gear
                </Button>
              )}
            </div>

            {/* แสดง loading เมื่อยังไม่มีสินค้าให้แสดงเท่านั้น
                ถ้าโหลดตะกร้าซ้ำหลัง checkout ผิดพลาด ให้คงรายการเดิมไว้จนข้อมูลใหม่มาถึง */}
            {loading && !data.length ? (
              <Card className="bg-[#121022] border-[#25203f] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-60 flex items-center justify-center">
                  <Ring className={"size-20 text-gpurple-3"} />
                </div>
              </Card>
            ) : data?.length === 0 ? (
              <Card className="bg-[#121022] border-[#25203f] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1c1833] flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Your cart is currently empty
                </h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Looks like you haven't added any GearVerse gaming equipment to
                  your cart yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {data?.map((item) => {
                  // ระหว่าง debounce ใช้จำนวนที่กดล่าสุด หลังบันทึกแล้วใช้จำนวนจาก backend
                  const displayQuantity = quantities[item._id] ?? item.quantity;
                  const itemTotal = item.product_id.price * displayQuantity;
                  return (
                    <Card
                      key={item._id}
                      className="bg-[#121022] border-0 shadow-none border-purple-600/20 hover:border-purple-400/50 rounded-2xl transition-all group"
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        {/* Product Thumbnail */}
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-[#2e264f] relative flex items-center justify-center">
                          <img
                            src={item.product_id.image_url}
                            alt={item.product_id.product_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Info & Metadata */}
                        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                            {item.product_id.product_name}
                          </h3>

                          {/* Specs Badge */}
                          <div>
                            <Badge
                              className={`${item.product_id.subcategory_ids.length === 0 && "hidden"} bg-[#1f1938] text-[#c084fc] hover:bg-[#2b214f] text-xs px-3 py-1 rounded-md font-medium border border-[#3b2a63]/50`}
                            >
                              {item.product_id.subcategory_ids.length !== 0
                                ? item.product_id.subcategory_ids[0]
                                    ?.subcategory_name
                                : ""}
                            </Badge>
                          </div>

                          {/* Delivery Info */}
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#10b981] text-xs font-semibold pt-1">
                            <Truck className="w-3.5 h-3.5" />
                            <span>Shipping ฿39 per order</span>
                          </div>
                        </div>

                        {/* Pricing & Controls Container */}
                        <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#231e3d]">
                          {/* Unit Price */}
                          <div className="text-center sm:text-right">
                            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                              Unit Price
                            </span>
                            <span className="text-white font-bold text-sm">
                              ฿{item.product_id.price.toFixed(2)}
                            </span>
                          </div>

                          {/* Quantity Counter */}
                          <div className="flex items-center bg-[#19152e] border border-[#2f2752] rounded-lg px-1.5 py-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                handleQuantity(item._id, "decrease")
                              }
                              className="text-slate-300 hover:text-white hover:bg-[#282147] rounded cursor-pointer"
                              aria-label="Decrease quantity"
                              disabled={busy || displayQuantity <= 1}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <span className="w-8 text-center font-extrabold text-white text-sm">
                              {displayQuantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                handleQuantity(item._id, "increase")
                              }
                              className="text-slate-300 hover:text-white hover:bg-[#282147] rounded cursor-pointer"
                              aria-label="Increase quantity"
                              disabled={busy}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          {/* Item Total */}
                          <div className="text-center sm:text-right min-w-[70px]">
                            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                              Total
                            </span>
                            <span className="text-white font-extrabold text-base tracking-tight">
                              ฿{itemTotal.toFixed(2)}
                            </span>
                          </div>

                          {/* Delete Button */}
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => handleRemoveItem(item._id)}
                            className="bg-[#27152b] hover:bg-[#3d183f] text-[#f43f5e] hover:text-rose-300 rounded-lg border border-[#4a1b3f]/60 cursor-pointer"
                            title="Remove item"
                            disabled={busy || hasPendingQuantities}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Bottom 3 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* Card 1: Secure Payment */}
              <Card className="bg-[#121022] border-[#231e3d] rounded-2xl">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#22173d] text-[#a855f7] flex items-center justify-center flex-shrink-0 border border-[#3b276b]/50">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Secure Payment
                    </h4>
                    <p className="text-slate-400 text-xs">
                      SSL Encrypted checkouts
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Fast Delivery */}
              <Card className="bg-[#121022] border-[#231e3d] rounded-2xl">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#22173d] text-[#a855f7] flex items-center justify-center flex-shrink-0 border border-[#3b276b]/50">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Fast Delivery
                    </h4>
                    <p className="text-slate-400 text-xs">
                      Same-day dispatch priority
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: 24/7 Support */}
              <Card className="bg-[#121022] border-[#231e3d] rounded-2xl">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#22173d] text-[#a855f7] flex items-center justify-center flex-shrink-0 border border-[#3b276b]/50">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      24/7 Support
                    </h4>
                    <p className="text-slate-400 text-xs">
                      Elite crew on standby
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Order Summary (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-extrabold text-white tracking-tight pb-2">
              Order Summary
            </h2>

            {/* Promo Code Card */}
            <Card className="bg-[#121022] border-[#231e3d] rounded-2xl">
              <CardContent className="p-5 space-y-3">
                <label className="block text-sm font-bold text-slate-200">
                  Promo Code / Gift Card
                </label>

                <form
                  onSubmit={handleApplyPromo}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <Input
                    type="text"
                    disabled={busy}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)} //ทุกครั้งที่ช่อง Input เปลี่ยน เอาค่าที่ผู้ใช้พิมพ์มาเก็บไว้ใน promoInput
                    placeholder="Enter code (e.g. GEAR30)"
                    className="bg-[#18152e] border-[#2e264f] text-white text-sm px-3.5 py-2.5 rounded-xl flex-1 focus:border-purple-500 font-mono tracking-wider placeholder-slate-500 uppercase h-auto"
                  />
                  {appliedCode ? (
                    <Button
                      type="button"
                      onClick={() => {
                        setAppliedCode("");
                        setPromoCode("");
                        setQuoteError("");
                      }}
                      title="Remove promo code"
                      disabled={busy}
                      className="bg-[#10b981] hover:bg-emerald-400 text-black font-extrabold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-500/20 cursor-pointer h-auto"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={busy || !data.length || !promoCode.trim()}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-100 h-auto"
                    >
                      Apply
                    </Button>
                  )}
                </form>

                {/* Applied Success banner */}
                {quote?.promo_code ? (
                  <div className="flex items-center gap-1.5 text-[#10b981] text-xs font-semibold pt-1">
                    <Check className="w-4 h-4" />
                    <span>
                      Code '
                      <span className="font-black">{quote.promo_code}</span>'
                      saved you ฿{quote.discount_amount.toFixed(2)}!
                    </span>
                  </div>
                ) : quoteError ? (
                  <p className="text-rose-400 text-xs font-medium pt-1">
                    {quoteError}
                  </p>
                ) : (
                  <></>
                )}
              </CardContent>
            </Card>

            {/* Price Calculations Card */}
            <Card className="bg-[#121022] border-[#231e3d] rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Cart Subtotal</span>
                    <span className="font-bold text-white text-base">
                      {quote ? `฿${totalPrice.toFixed(2)}` : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>Discount Applied</span>
                    <span className="font-bold text-[#10b981] text-base">
                      {/* {discount > 0 ? `-$${discount.toFixed(2)}` : "$0.00"} */}
                      {quote ? `฿${quote.discount_amount.toFixed(2)}` : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-white text-base">
                      ฿{shipping.toFixed(2)}
                    </span>
                  </div>
                </div>

                <hr className="border-[#231e3d] my-2" />

                {/* Grand Total */}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-lg sm:text-xl font-extrabold text-white">
                    Grand Total
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {quote ? `฿${sumPrice.toFixed(2)}` : "—"}
                  </span>
                </div>

                {/* ปิดปุ่มจ่ายเมื่อกำลังบันทึก/โหลด หรือยังไม่มียอด backend ที่ตรงกับตะกร้าปัจจุบัน */}
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={busy || loading || !data.length || !quote}
                  className={`w-full py-4 h-auto rounded-xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                    data.length === 0
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] text-slate-950 hover:brightness-110 hover:shadow-cyan-500/25 active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  <span>{busy ? "PLEASE WAIT…" : "PAY WITH PROMPTPAY"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Button>

                {/* Security badge footer */}
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs pt-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Guaranteed secure checkout protocols active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Dialog using shadcn UI Dialog */}
        {/* <Dialog open={checkoutSuccess} onOpenChange={setCheckoutSuccess}>
          <DialogContent className="bg-[#151229] border-purple-500/30 text-slate-100 rounded-3xl p-5 sm:p-8 w-[calc(100%-2rem)] max-w-md">
            <DialogHeader className="text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-full flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <DialogTitle className="text-2xl font-extrabold text-white text-center">
                Order Demo Ready!
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-sm text-center">
                Proceeding to checkout with grand total of{" "}
                <strong className="text-white font-bold">
                  ${grandTotal.toFixed(2)}
                </strong>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="bg-[#1d1938] border border-[#332b59] rounded-xl p-4 text-xs text-slate-400 space-y-1 font-mono my-2">
              <p>Status: Cart Synced to MongoDB</p>
              <p>Items: {totalItemCount} unit(s)</p>
              <p>Promo: {appliedPromo ? appliedPromo.code : "None"}</p>
              <p>Cart tied to user ID and ready for order checkout.</p>
            </div>

            <Button
              onClick={() => setCheckoutSuccess(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg h-auto"
            >
              Close & Continue Browsing
            </Button>
          </DialogContent>
        </Dialog> */}
      </div>
    </div>
  );
}
