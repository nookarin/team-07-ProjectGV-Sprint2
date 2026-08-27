/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { titanKeysElite } from './data/products';
import { ColorOption, SwitchOption, CartItem, Currency } from './types';
import { Header } from './components/Header';
import { ProductGallery } from './components/ProductGallery';
import { ProductDetails } from './components/ProductDetails';
import { DescriptionCard } from './components/DescriptionCard';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { ProfileModal } from './components/ProfileModal';
import { Footer } from './components/Footer';
import { VsCodeModal } from './components/VsCodeModal';
import { Sparkles, ArrowUpRight, CheckCircle } from 'lucide-react';

export default function App() {
  const product = titanKeysElite;

  // Selected State
  const [selectedColor, setSelectedColor] = useState<ColorOption>(product.colors[0]);
  const [selectedSwitch, setSelectedSwitch] = useState<SwitchOption>(product.switches[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [currency, setCurrency] = useState<Currency>('USD');

  // Initial cart items (badge shows 3 items matching screenshot)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      productId: product.id,
      name: product.name,
      color: product.colors[0],
      switchOption: product.switches[0],
      price: product.price,
      quantity: 1,
      image: product.colors[0].image,
    },
    {
      productId: 'titan-keycaps-neon',
      name: 'Cyberpunk PBT Double-Shot Keycaps',
      color: product.colors[2],
      switchOption: product.switches[1],
      price: 69,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=400&q=80',
    },
    {
      productId: 'titan-lube-kit',
      name: 'Titan Pro Switch Lube Station Kit',
      color: product.colors[0],
      switchOption: product.switches[0],
      price: 29,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80',
    },
  ]);

  // Modal / Drawer States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVsCodeModalOpen, setIsVsCodeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToCart = () => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.color.id === selectedColor.id &&
          item.switchOption.id === selectedSwitch.id
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            color: selectedColor,
            switchOption: selectedSwitch,
            price: product.price,
            quantity: quantity,
            image: selectedColor.image,
          },
        ];
      }
    });

    showToast(`Added ${quantity}x TitanKeys Elite (${selectedColor.name}) to cart!`);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removed from cart');
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setIsCartOpen(false);
    showToast('Order confirmed! Thank you for purchasing from GearVerse.');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#D1D1D1] flex flex-col selection:bg-[#264F78] selection:text-white">
      
      {/* Top Bar / Announcement Banner (Sophisticated Dark Studio) */}
      <div className="bg-[#0F0F0F] border-b border-[#222222] py-2 px-4 text-center text-xs font-medium tracking-wide text-[#999999] flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#4FC1FF]" />
        <span>STUDIO PRECISION 2026: GET 20% OFF ON TITANKEYS ELITE WITH CODE <strong className="text-[#4FC1FF] font-mono font-semibold">GEAR15</strong></span>
        <button
          onClick={() => setIsVsCodeModalOpen(true)}
          className="ml-2 text-[#4FC1FF] hover:underline hidden sm:inline-flex items-center gap-1 cursor-pointer font-mono"
        >
          [ ดูโค้ดสำหรับ VS Code <ArrowUpRight className="w-3 h-3" /> ]
        </button>
      </div>

      {/* Main Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenVsCodeGuide={() => setIsVsCodeModalOpen(true)}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Main Product Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* Top Product Showcase (2-Column Grid matching screenshot) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Product Image & Tags */}
          <div className="lg:col-span-7">
            <ProductGallery
              selectedColor={selectedColor}
              tags={product.tags}
            />
          </div>

          {/* Right Column: Title, Price, Switches, Color, Quantity, Add to Cart */}
          <div className="lg:col-span-5">
            <ProductDetails
              title={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              discountPercentage={product.discountPercentage}
              colors={product.colors}
              switches={product.switches}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              selectedSwitch={selectedSwitch}
              onSelectSwitch={setSelectedSwitch}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              currency={currency}
            />
          </div>
        </section>

        {/* Full-Width Description Block with Studio Banner */}
        <section className="w-full pt-2">
          <DescriptionCard product={product} />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        currency={currency}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        product={product}
        onSelectProduct={() => {
          showToast('Viewing TitanKeys Elite');
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* VS Code Code & Guide Modal */}
      <VsCodeModal
        isOpen={isVsCodeModalOpen}
        onClose={() => setIsVsCodeModalOpen(false)}
      />

      {/* Floating Action Button for VS Code code */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          id="floating-vscode-btn"
          onClick={() => setIsVsCodeModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#141414]/90 hover:bg-[#1F1F1F] border border-[#333333] hover:border-[#4FC1FF] text-[#EEEEEE] rounded-full shadow-lg backdrop-blur-md text-xs font-semibold tracking-wide transition-all cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-[#4FC1FF] group-hover:rotate-12 transition-transform" />
          <span>โค้ดสำหรับ VS Code</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#181818] border border-[#333333] text-[#EEEEEE] text-xs font-medium rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="w-4 h-4 text-[#4EC9B0]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
