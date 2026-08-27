import React, { useState } from 'react';
import { CartItem, Currency } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  currency: Currency;
  onCheckoutSuccess: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  currency,
  onCheckoutSuccess,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const formatPrice = (amount: number) => {
    let rate = 1;
    let symbol = '$';
    if (currency === 'EUR') {
      rate = 0.92;
      symbol = '€';
    } else if (currency === 'THB') {
      rate = 35.5;
      symbol = '฿';
    } else if (currency === 'GBP') {
      rate = 0.79;
      symbol = '£';
    } else if (currency === 'JPY') {
      rate = 155;
      symbol = '¥';
    }
    return `${Math.round(amount * rate)} ${symbol}`;
  };

  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedDiscount ? rawSubtotal * appliedDiscount : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);
  const freeShippingThreshold = 200;
  const progressToFreeShipping = Math.min(100, (rawSubtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'GEAR15' || promoCode.trim().toUpperCase() === 'CYBER20') {
      setAppliedDiscount(0.15);
      setPromoError('');
    } else {
      setPromoError('Invalid coupon. Try code "GEAR15" for 15% off.');
    }
  };

  const handleCompleteOrder = () => {
    setIsCheckingOut(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#00f0ff', '#f43f5e', '#ffffff'],
    });

    setTimeout(() => {
      setIsCheckingOut(false);
      onCheckoutSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D0D0D] border-l border-[#262626] text-[#D1D1D1] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Cart Header */}
          <div className="p-5 border-b border-[#222222] flex items-center justify-between bg-[#141414]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#4FC1FF]" />
              <h2 className="text-lg font-bold tracking-wide font-heading text-white">
                STUDIO CART ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#888888] hover:text-white rounded-lg hover:bg-[#222222] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-[#121212] border-b border-[#222222]">
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-[#CCCCCC]">
                {rawSubtotal >= freeShippingThreshold ? (
                  <span className="text-[#4EC9B0] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> FREE WORLDWIDE SHIPPING UNLOCKED
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#4FC1FF]">{formatPrice(freeShippingThreshold - rawSubtotal)}</strong> more for Free Shipping
                  </span>
                )}
              </span>
              <span className="text-[#888888]">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0E639C] to-[#4FC1FF] rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center text-[#4FC1FF]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-[#888888] text-sm">Your studio cart is currently empty.</p>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-[#0E639C] hover:bg-[#1177BB] text-white rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Explore Studio Gear
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.color.id}-${item.switchOption.id}-${idx}`}
                  className="p-3.5 bg-[#141414] border border-[#222222] hover:border-[#333333] rounded-xl flex gap-3.5 relative group transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 object-cover rounded-lg bg-[#070707] border border-[#262626]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="text-[#666666] hover:text-[#CE9178] p-1 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] text-[#888888] mt-0.5 space-y-0.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span>Color:</span>
                        <span className="text-[#D1D1D1] font-medium">{item.color.name}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block ml-0.5 border border-black/40"
                          style={{ backgroundColor: item.color.hex }}
                        />
                      </div>
                      <div>
                        <span>Switch: </span>
                        <span className="text-[#4FC1FF] font-medium">{item.switchOption.name}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-[#1B1B1B] border border-[#2A2A2A] rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 flex items-center justify-center text-[#888888] hover:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#888888] hover:text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-sm font-bold text-[#4FC1FF] font-mono">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Promo Code & Order Summary */}
          {items.length > 0 && (
            <div className="p-5 bg-[#121212] border-t border-[#222222] space-y-4">
              {/* Promo input */}
              <form onSubmit={handleApplyPromo} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Coupon (e.g. GEAR15)"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#4FC1FF] uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] text-xs font-semibold text-[#D1D1D1] rounded-lg transition-colors cursor-pointer border border-[#333333]"
                  >
                    Apply
                  </button>
                </div>
                {appliedDiscount && (
                  <p className="text-[11px] text-[#4EC9B0] font-mono">Coupon applied! 15% discount active.</p>
                )}
                {promoError && (
                  <p className="text-[11px] text-[#CE9178] font-mono">{promoError}</p>
                )}
              </form>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-[#888888] border-t border-[#222222] pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#D1D1D1] font-mono">{formatPrice(rawSubtotal)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-[#4EC9B0] font-medium font-mono">
                    <span>Discount (15%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[#4FC1FF] font-mono font-medium">
                    {rawSubtotal >= freeShippingThreshold ? 'FREE' : formatPrice(15)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#222222]">
                  <span>Estimated Total</span>
                  <span className="text-[#4FC1FF] font-mono text-base">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCompleteOrder}
                disabled={isCheckingOut}
                className="w-full py-3.5 bg-[#0E639C] hover:bg-[#1177BB] text-white font-semibold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <span>Processing Studio Checkout...</span>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#777777]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4EC9B0]" />
                <span>256-Bit Encrypted Studio Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
