import { useState, useEffect, useRef } from "react"; //เก็บสถานะที่ React กำลังใช้แสดงหน้าเว็บ, สั่งให้ React ทำอะไรบางอย่าง หลังจาก Component ถูกโหลด
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
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

// Import shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { useCart } from "@/contexts/Cart/CartProvider";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";
import { Ring } from "#components/ring";

//เปิด browser
export default function CartPage() {
  const { user, url } = useAuth();
  const { data, getCart, setCart, loading, handleClearAll } = useCart();
  const [quantities, setQuantities] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [sumPrice, setSumPrice] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [promotion, setPromotion] = useState([]);
  const [errPromo, setErrPromo] = useState("");
  const shipping = 39;

  const handleRemoveItem = async (itemId) => {
    const response = await axios.delete(
      `${url}/shoppingcart/${user._id}/items/${itemId}`,
      {
        withCredentials: true,
      },
    );
    getCart()
  };

  const syncQuantity = useDebouncedCallback(async (itemId, newQuantity) => {
    try {
      const response = await axios.patch(
        `${url}/shoppingcart/${user._id}/items/${itemId}`,
        {
          quantity: newQuantity,
        },
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!", {
        richColors: true,
      });

      setQuantities((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  }, 500);

  const handleQuantity = (itemId, type) => {
    const currentQuantity =
      quantities[itemId] ??
      data.find((item) => item._id === itemId)?.quantity ??
      1;

    let newQuantity = currentQuantity;

    if (type === "increase") {
      newQuantity = currentQuantity + 1;
    }
    if (type === "decrease") {
      newQuantity = currentQuantity - 1;
    }
    // ป้องกันไม่ให้ต่ำกว่า 1
    if (newQuantity < 1) {
      return;
    }
    setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
    syncQuantity(itemId, newQuantity);
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setErrPromo("");
    setPromotion([]);
    const response = await axios.get(`${url}/promo?code=${promoCode}`, {
      withCredentials: true,
    });
    console.log(response.data.data);
    if (response.data.success === false) {
      setErrPromo(response.data.message);
      return;
    } else {
      setErrPromo("");
      setPromotion(response.data.data);
    }
  };

  const handleRemovePromo = () => {
    setPromotion([]);
    setErrPromo("");
    setPromoCode("");
  };

  useEffect(() => {
    const grandTotal = async () => {
      let discount;
      const priceArr = data.map((product) => {
        return product.quantity * product.product_id.price;
      });
      const total = priceArr.reduce((acc, currentVal) => acc + currentVal, 0);
      setTotalPrice(total);

      if (!promotion[0]) {
        discount = 0;
      } else if (promotion[0].discount_type === "baht") {
        discount = promotion[0].discount_amount;
      } else {
        discount = total * (promotion[0].discount_amount / 100);
      }
      setSumPrice(total + shipping - discount);
    };
    grandTotal();
  }, [data, promotion]);

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
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-rose-400 text-sm font-medium underline underline-offset-4 p-0 h-auto cursor-pointer"
                >
                  Clear All Gear
                </Button>
              )}
            </div>

            {/* Cart Items List */}
            {loading ? (
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
                            <span>Free Delivery</span>
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
                              ${item.product_id.price.toFixed(2)}
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
                              ${itemTotal.toFixed(2)}
                            </span>
                          </div>

                          {/* Delete Button */}
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => handleRemoveItem(item._id)}
                            className="bg-[#27152b] hover:bg-[#3d183f] text-[#f43f5e] hover:text-rose-300 rounded-lg border border-[#4a1b3f]/60 cursor-pointer"
                            title="Remove item"
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
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)} //ทุกครั้งที่ช่อง Input เปลี่ยน เอาค่าที่ผู้ใช้พิมพ์มาเก็บไว้ใน promoInput
                    placeholder="Enter code (e.g. GEAR30)"
                    className="bg-[#18152e] border-[#2e264f] text-white text-sm px-3.5 py-2.5 rounded-xl flex-1 focus:border-purple-500 font-mono tracking-wider placeholder-slate-500 uppercase h-auto"
                  />
                  {promotion.length > 0 ? (
                    <Button
                      type="button"
                      onClick={handleRemovePromo}
                      title="Remove promo code"
                      className="bg-[#10b981] hover:bg-emerald-400 text-black font-extrabold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-500/20 cursor-pointer h-auto"
                    >
                      Applied
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!promoCode.trim()}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-100 h-auto"
                    >
                      Apply
                    </Button>
                  )}
                </form>

                {/* Applied Success banner */}
                {promotion.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-[#10b981] text-xs font-semibold pt-1">
                    <Check className="w-4 h-4" />
                    <span>
                      Code '
                      <span className="font-black">{promotion[0].name}</span>'
                      saved you {promotion[0].discount_type === "baht" && "฿"}
                      {promotion[0].discount_amount}
                      {promotion[0].discount_type === "percent" && "%"}!
                    </span>
                  </div>
                ) : errPromo ? (
                  <p className="text-rose-400 text-xs font-medium pt-1">
                    {errPromo}
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
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>Discount Applied</span>
                    <span className="font-bold text-[#10b981] text-base">
                      {/* {discount > 0 ? `-$${discount.toFixed(2)}` : "$0.00"} */}
                      {!promotion[0]
                        ? "฿0.00"
                        : promotion[0].discount_type === "baht"
                          ? `฿${promotion[0].discount_amount.toFixed(2)}`
                          : `฿${(totalPrice * (promotion[0].discount_amount / 100)).toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-white text-base">
                      ${shipping.toFixed(2)}
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
                    ${sumPrice}
                  </span>
                </div>

                {/* Proceed to Checkout Button */}
                <Button
                  // onClick={handleProceedToCheckout}
                  // disabled={items.length === 0}
                  className={`w-full py-4 h-auto rounded-xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                    data.length === 0
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] text-slate-950 hover:brightness-110 hover:shadow-cyan-500/25 active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  <span>PROCEED TO CHECKOUT</span>
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
