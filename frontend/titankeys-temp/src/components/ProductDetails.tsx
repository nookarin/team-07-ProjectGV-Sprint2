import React, { useState } from 'react';
import { ColorOption, SwitchOption, Currency } from '../types';
import { soundEngine } from '../utils/audio';
import { Heart, Volume2, ShieldCheck, Truck, RefreshCw, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductDetailsProps {
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  colors: ColorOption[];
  switches: SwitchOption[];
  selectedColor: ColorOption;
  onSelectColor: (c: ColorOption) => void;
  selectedSwitch: SwitchOption;
  onSelectSwitch: (s: SwitchOption) => void;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
  currency: Currency;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  title,
  price,
  originalPrice,
  discountPercentage,
  colors,
  switches,
  selectedColor,
  onSelectColor,
  selectedSwitch,
  onSelectSwitch,
  quantity,
  onQuantityChange,
  onAddToCart,
  currency,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Currency multiplier & symbol formatting
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

    const converted = Math.round(amount * rate);
    return `${converted} ${symbol}`;
  };

  const handleTestSound = (switchOpt: SwitchOption) => {
    setIsTestingSound(true);
    soundEngine.playSwitchSound(switchOpt.type);
    setTimeout(() => setIsTestingSound(false), 200);
  };

  const handleAddToCartWithFx = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAddedAnimation(true);
    onAddToCart();

    // Trigger celebratory confetti burst
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: ['#a855f7', '#00f0ff', '#ec4899', '#ffffff'],
      ticks: 200,
    });

    setTimeout(() => {
      setAddedAnimation(false);
    }, 1200);
  };

  const totalPrice = price * quantity;

  return (
    <div className="flex flex-col space-y-7">
      
      {/* Product Title */}
      <div>
        <div className="flex items-center justify-between">
          <h1
            id="product-title-heading"
            className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white font-heading"
          >
            {title}
          </h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-[#888888] font-mono flex items-center gap-2">
          <span>SKU: TK-ELITE-75-STUDIO</span>
          <span className="text-[#444444]">•</span>
          <span className="text-[#4EC9B0] flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#4EC9B0]"></span>
            IN STOCK & READY TO DISPATCH
          </span>
        </p>
      </div>

      {/* Price Block: "$399", "$479", "20% OFF" */}
      <div className="flex items-center gap-4 flex-wrap">
        <span
          id="product-current-price"
          className="text-2xl sm:text-3xl font-extrabold text-[#4FC1FF] tracking-tight font-mono"
        >
          {formatPrice(price)}
        </span>
        <span
          id="product-original-price"
          className="text-lg sm:text-xl font-medium text-[#666666] line-through font-mono"
        >
          {formatPrice(originalPrice)}
        </span>
        <span
          id="product-discount-badge"
          className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-[#1A1A1A] text-[#CE9178] border border-[#CE9178]/40 rounded-md"
        >
          {discountPercentage}% OFF
        </span>
      </div>

      {/* Mechanical Switch Selector + Sound Tester */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#999999]">
          <span>SELECT SWITCH TYPE</span>
          <span className="text-[#4FC1FF] font-mono lowercase">
            {selectedSwitch.name}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2.5">
          {switches.map((sw) => {
            const isSelected = selectedSwitch.id === sw.id;
            return (
              <button
                key={sw.id}
                id={`switch-option-${sw.id}`}
                onClick={() => {
                  onSelectSwitch(sw);
                  handleTestSound(sw);
                }}
                className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#181818] border-[#4FC1FF] ring-1 ring-[#4FC1FF]/30 shadow-md'
                    : 'bg-[#121212] border-[#222222] hover:border-[#333333] hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-black/40"
                    style={{ backgroundColor: sw.color }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestSound(sw);
                    }}
                    title="Click to hear mechanical switch sound"
                    className="p-1 text-[#777777] hover:text-[#4FC1FF] transition-colors"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isTestingSound && isSelected ? 'text-[#4FC1FF] scale-125' : ''}`} />
                  </button>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#D1D1D1] capitalize group-hover:text-white">
                    {sw.type}
                  </div>
                  <div className="text-[10px] text-[#888888] font-mono mt-0.5">
                    {sw.actuationForce}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selector: "COLOR: BLACK" with Swatches */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#999999]">
          <span>COLOR: </span>
          <span id="selected-color-label" className="text-white font-bold font-mono">
            {selectedColor.name.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-3.5">
          {colors.map((color) => {
            const isSelected = selectedColor.id === color.id;
            return (
              <button
                key={color.id}
                id={`color-swatch-${color.id}`}
                onClick={() => onSelectColor(color)}
                aria-label={`Select ${color.name}`}
                className={`relative w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#4FC1FF] ring-offset-2 ring-offset-[#0A0A0A] scale-110 shadow-lg'
                    : 'hover:scale-105 opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {/* Border outline for dark color or special border */}
                {color.id === 'black' && (
                  <span className="w-full h-full rounded-full border border-[#444444]"></span>
                )}
                {color.id === 'white' && (
                  <span className="w-full h-full rounded-full border border-[#666666]"></span>
                )}
                {isSelected && (
                  <Check
                    className={`w-4 h-4 ${
                      color.id === 'white' || color.id === 'lilac' ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#999999]">
          QUANTITY
        </div>
        <div
          id="product-quantity-selector"
          className="inline-flex items-center bg-[#141414] border border-[#262626] rounded-xl overflow-hidden p-1 shadow-inner"
        >
          <button
            id="btn-decrease-qty"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-9 h-9 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#222222] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono font-bold text-sm cursor-pointer"
          >
            -
          </button>
          <span
            id="product-qty-display"
            className="w-12 text-center text-sm font-bold font-mono text-white"
          >
            {quantity}
          </span>
          <button
            id="btn-increase-qty"
            onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
            disabled={quantity >= 10}
            aria-label="Increase quantity"
            className="w-9 h-9 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#222222] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono font-bold text-sm cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        {/* Main "Add to cart – $399" Button */}
        <button
          id="btn-add-to-cart"
          onClick={handleAddToCartWithFx}
          className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
            addedAnimation
              ? 'bg-[#10B981] text-white scale-[0.99]'
              : 'bg-[#0E639C] hover:bg-[#1177BB] text-white shadow-lg active:scale-[0.99]'
          }`}
        >
          {addedAnimation ? (
            <>
              <Check className="w-4 h-4 animate-bounce" />
              <span>Added to Studio Cart!</span>
            </>
          ) : (
            <span>Add to cart – {formatPrice(totalPrice)}</span>
          )}
        </button>

        {/* Wishlist Heart Button */}
        <button
          id="btn-toggle-wishlist"
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label="Save to wishlist"
          className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
            isWishlisted
              ? 'bg-[#1C1A1A] border-[#CE9178] text-[#CE9178] shadow-sm'
              : 'bg-[#141414] border-[#262626] text-[#777777] hover:text-[#CE9178] hover:border-[#333333]'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              isWishlisted ? 'fill-[#CE9178] scale-110 text-[#CE9178]' : 'hover:scale-110'
            }`}
          />
        </button>
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#222222] text-[11px] text-[#888888]">
        <div className="flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-[#4FC1FF] shrink-0" />
          <span>Express Worldwide Dispatch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#4EC9B0] shrink-0" />
          <span>2-Year Studio Warranty</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-[#DCDCAA] shrink-0" />
          <span>30-Day Money-back Return</span>
        </div>
      </div>
    </div>
  );
};
