import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  getInitialCart,
  saveCart,
  getSavedPromo,
  savePromo,
  validatePromoCode,
  resetToDefaultCart,
  DEFAULT_SHIPPING,
} from "#lib/cart-service";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const loadedItems = getInitialCart();
    setItems(loadedItems);

    const savedPromoCode = getSavedPromo();
    if (savedPromoCode) {
      const res = validatePromoCode(savedPromoCode);
      if (res.valid) {
        setAppliedPromo(res);
        setPromoInput(savedPromoCode);
      }
    }
  }, []);

  const handleQuantityChange = (id, delta) => {
    setItems((prevItems) => {
      const updated = prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);

      saveCart(updated);
      return updated;
    });
  };

  const handleRemoveItem = (id) => {
    setItems((prevItems) => {
      const updated = prevItems.filter((item) => item.id !== id);
      saveCart(updated);
      return updated;
    });
  };

  const handleClearAll = () => {
    setItems([]);
    saveCart([]);
  };

  const handleResetDemo = () => {
    const { items: resetItems, promoCode } = resetToDefaultCart();
    setItems(resetItems);
    const res = validatePromoCode(promoCode);
    setAppliedPromo(res);
    setPromoInput(promoCode);
    setPromoError("");
    setCheckoutSuccess(false);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const res = validatePromoCode(promoInput);
    if (res.valid) {
      setAppliedPromo(res);
      savePromo(res.code);
      setPromoError("");
    } else {
      setPromoError(res.error);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    savePromo(null);
    setPromoError("");
  };

  // Price calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const discount = appliedPromo ? appliedPromo.discount : 0;
  const shipping = items.length > 0 ? DEFAULT_SHIPPING : 0;
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  const handleProceedToCheckout = () => {
    setCheckoutSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#090813] text-slate-100 py-10 px-4 sm:px-6 lg:px-12 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items & Info (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Shopping Cart
                </h1>
                <Badge className="bg-[#1e1a33] text-slate-300 hover:bg-[#282345] font-semibold text-xs px-3 py-1 rounded-md border border-[#2f294d]/60">
                  {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                </Badge>
              </div>

              {items.length > 0 ? (
                <Button
                  variant="link"
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-rose-400 text-sm font-medium underline underline-offset-4 p-0 h-auto cursor-pointer"
                >
                  Clear All Gear
                </Button>
              ) : (
                <Button
                  variant="link"
                  onClick={handleResetDemo}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium p-0 h-auto flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Demo Items
                </Button>
              )}
            </div>

            {/* Cart Items List */}
            {items.length === 0 ? (
              <Card className="bg-[#121022] border-[#25203f] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1c1833] flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Your cart is currently empty
                </h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Looks like you haven't added any GearVerse gaming equipment to your cart yet.
                </p>
                <Button
                  onClick={handleResetDemo}
                  className="mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-500/20"
                >
                  Load Demo Items
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const itemTotal = item.unitPrice * item.quantity;
                  return (
                    <Card
                      key={item.id}
                      className="bg-[#121022]!border-0!shadow-none border-purple-600/20 hover:border-purple-400/50 rounded-2xl transition-all group"
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        {/* Product Thumbnail */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-[#2e264f] relative flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Info & Metadata */}
                        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                          <h3 className="text-lg font-bold text-white tracking-wide truncate">
                            {item.name}
                          </h3>

                          {/* Specs Badge */}
                          <div>
                            <Badge className="bg-[#1f1938] text-[#c084fc] hover:bg-[#2b214f] text-xs px-3 py-1 rounded-md font-medium border border-[#3b2a63]/50">
                              {item.tag}
                            </Badge>
                          </div>

                          {/* Delivery Info */}
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#10b981] text-xs font-semibold pt-1">
                            <Truck className="w-3.5 h-3.5" />
                            <span>{item.delivery}</span>
                          </div>
                        </div>

                        {/* Pricing & Controls Container */}
                        <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#231e3d]">
                          {/* Unit Price */}
                          <div className="text-center sm:text-right">
                            <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                              Unit Price
                            </span>
                            <span className="text-white font-bold text-sm">
                              ${item.unitPrice.toFixed(2)}
                            </span>
                          </div>

                          {/* Quantity Counter */}
                          <div className="flex items-center bg-[#19152e] border border-[#2f2752] rounded-lg px-1.5 py-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="text-slate-300 hover:text-white hover:bg-[#282147] rounded cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <span className="w-8 text-center font-extrabold text-white text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleQuantityChange(item.id, 1)}
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
                            onClick={() => handleRemoveItem(item.id)}
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
                    <h4 className="text-sm font-bold text-white">Secure Payment</h4>
                    <p className="text-slate-400 text-xs">SSL Encrypted checkouts</p>
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
                    <h4 className="text-sm font-bold text-white">Fast Delivery</h4>
                    <p className="text-slate-400 text-xs">Same-day dispatch priority</p>
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
                    <h4 className="text-sm font-bold text-white">24/7 Support</h4>
                    <p className="text-slate-400 text-xs">Elite crew on standby</p>
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

                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <Input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code (e.g. GEAR30)"
                    className="bg-[#18152e] border-[#2e264f] text-white text-sm px-3.5 py-2.5 rounded-xl flex-1 focus:border-purple-500 font-mono tracking-wider placeholder-slate-500 uppercase h-auto"
                  />
                  {appliedPromo ? (
                    <Button
                      type="button"
                      onClick={handleRemovePromo}
                      className="bg-[#10b981] hover:bg-emerald-400 text-black font-extrabold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-500/20 cursor-pointer h-auto"
                    >
                      Applied
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm cursor-pointer h-auto"
                    >
                      Apply
                    </Button>
                  )}
                </form>

                {/* Applied Success banner */}
                {appliedPromo && (
                  <div className="flex items-center gap-1.5 text-[#10b981] text-xs font-semibold pt-1">
                    <Check className="w-4 h-4" />
                    <span>{appliedPromo.description}</span>
                  </div>
                )}

                {/* Error message banner */}
                {promoError && (
                  <p className="text-rose-400 text-xs font-medium pt-1">
                    {promoError}
                  </p>
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
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span>Discount Applied</span>
                    <span className="font-bold text-[#10b981] text-base">
                      {discount > 0 ? `-$${discount.toFixed(2)}` : "$0.00"}
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
                  <span className="text-xl font-extrabold text-white">
                    Grand Total
                  </span>
                  <span className="text-3xl font-black text-white tracking-tight">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* Proceed to Checkout Button */}
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={items.length === 0}
                  className={`w-full py-4 h-auto rounded-xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                    items.length === 0
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
        <Dialog open={checkoutSuccess} onOpenChange={setCheckoutSuccess}>
          <DialogContent className="bg-[#151229] border-purple-500/30 text-slate-100 rounded-3xl p-8 max-w-md">
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
              <p>Status: Local Cart State Validated</p>
              <p>Items: {totalItemCount} unit(s)</p>
              <p>Promo: {appliedPromo ? appliedPromo.code : "None"}</p>
              <p>Ready to connect to real backend API anytime!</p>
            </div>

            <Button
              onClick={() => setCheckoutSuccess(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg h-auto"
            >
              Close & Continue Browsing
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}