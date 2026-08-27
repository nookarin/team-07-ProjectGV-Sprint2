import React, { useState } from 'react';
import { Search, User, ShoppingBag, ChevronDown, Sparkles, X, Menu } from 'lucide-react';
import { Currency } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenVsCodeGuide: () => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenProfile,
  onOpenVsCodeGuide,
  currency,
  onCurrencyChange,
}) => {
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222222]">
      {/* Top Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo with Studio Delta Icon */}
          <div className="flex items-center space-x-8">
            <a
              id="gearverse-brand-logo"
              href="#top"
              className="flex items-center gap-3 group focus:outline-none"
            >
              {/* Stylized Studio Delta/Triangle Logo */}
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#1F1F1F] rounded-lg border border-[#333333] group-hover:border-[#4FC1FF] transition-colors"></div>
                <svg
                  className="w-6 h-6 relative z-10"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon
                    points="20,4 36,34 4,34"
                    fill="#0A0A0A"
                    stroke="#4FC1FF"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 24L20 12L26 24M16 22H24"
                    stroke="#DCDCAA"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-wider text-[#FFFFFF] font-heading hidden sm:inline-block">
                TITAN<span className="text-[#4FC1FF]">KEYS</span>
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold tracking-wider">
              {/* SHOP Dropdown */}
              <div className="relative">
                <button
                  id="nav-shop-button"
                  onClick={() => setShopMenuOpen(!shopMenuOpen)}
                  onMouseEnter={() => setShopMenuOpen(true)}
                  className="flex items-center gap-1 text-[#4FC1FF] hover:text-[#9CDCFE] transition-colors uppercase py-2 cursor-pointer font-medium tracking-wider"
                >
                  SHOP
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${shopMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {shopMenuOpen && (
                  <div
                    onMouseLeave={() => setShopMenuOpen(false)}
                    className="absolute top-full left-0 mt-1 w-56 bg-[#141414] border border-[#2D2D2D] rounded-xl shadow-2xl p-2 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-3 py-2 text-[11px] font-semibold text-[#888888] tracking-wider uppercase border-b border-[#222222]">
                      Hardware Categories
                    </div>
                    <a href="#titankeys" className="flex items-center justify-between px-3 py-2 text-xs text-[#D1D1D1] hover:bg-[#1F1F1F] hover:text-[#FFFFFF] rounded-lg transition-colors">
                      <span>Mechanical Keyboards</span>
                      <span className="text-[10px] bg-[#1F1F1F] text-[#4FC1FF] border border-[#333333] px-1.5 py-0.5 rounded font-mono">NEW</span>
                    </a>
                    <a href="#custom-switches" className="block px-3 py-2 text-xs text-[#AAAAAA] hover:bg-[#1F1F1F] hover:text-[#FFFFFF] rounded-lg transition-colors">
                      Switches & Lubes
                    </a>
                    <a href="#keycaps" className="block px-3 py-2 text-xs text-[#AAAAAA] hover:bg-[#1F1F1F] hover:text-[#FFFFFF] rounded-lg transition-colors">
                      PBT Custom Keycaps
                    </a>
                    <a href="#desk-mats" className="block px-3 py-2 text-xs text-[#AAAAAA] hover:bg-[#1F1F1F] hover:text-[#FFFFFF] rounded-lg transition-colors">
                      Studio Desk Mats
                    </a>
                  </div>
                )}
              </div>

              <a
                id="nav-collections-link"
                href="#collections"
                className="text-[#999999] hover:text-[#FFFFFF] transition-colors uppercase font-medium tracking-wider"
              >
                COLLECTIONS
              </a>

              <a
                id="nav-new-arrivals-link"
                href="#new-arrivals"
                className="text-[#999999] hover:text-[#FFFFFF] transition-colors uppercase font-medium tracking-wider"
              >
                NEW ARRIVALS
              </a>

              {/* SALE badge */}
              <a
                id="nav-sale-badge"
                href="#sale"
                className="relative px-2.5 py-1 text-[11px] font-bold text-[#CE9178] border border-[#CE9178]/50 rounded-md hover:bg-[#CE9178]/10 transition-all uppercase tracking-wider font-mono"
              >
                SALE 20%
              </a>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* VS Code Code button */}
            <button
              id="btn-vscode-guide"
              onClick={onOpenVsCodeGuide}
              title="Get source code for VS Code"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#141414] hover:bg-[#1F1F1F] border border-[#2D2D2D] hover:border-[#4FC1FF] text-[#D1D1D1] hover:text-white rounded-lg transition-all shadow-sm font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#4FC1FF]" />
              <span>VS Code Code</span>
            </button>

            {/* Search Icon */}
            <button
              id="header-search-button"
              onClick={onOpenSearch}
              aria-label="Search store"
              className="p-2 text-[#999999] hover:text-[#FFFFFF] hover:bg-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Profile Button */}
            <button
              id="header-profile-button"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#D1D1D1] hover:text-white hover:bg-[#1A1A1A] border border-[#262626] rounded-lg transition-all"
            >
              <User className="w-3.5 h-3.5 text-[#4FC1FF]" />
              <span className="hidden sm:inline uppercase tracking-wider text-[11px]">PROFILE</span>
            </button>

            {/* Cart Icon with badge */}
            <button
              id="header-cart-button"
              onClick={onOpenCart}
              aria-label="Open Cart"
              className="relative flex items-center p-2 text-[#D1D1D1] hover:text-white hover:bg-[#1A1A1A] rounded-lg border border-[#262626] transition-all cursor-pointer group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform text-[#4FC1FF]" />
              <span className="ml-1.5 px-1.5 py-0.2 bg-[#222222] border border-[#333333] text-[10px] font-bold text-[#4FC1FF] rounded font-mono">
                {cartCount}
              </span>
            </button>

            {/* Currency / Language Selector */}
            <div className="relative">
              <select
                id="header-currency-selector"
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                className="bg-transparent text-xs font-mono text-[#888888] hover:text-[#D1D1D1] border-none focus:outline-none cursor-pointer pr-2 py-1 tracking-wider"
              >
                <option value="USD" className="bg-[#141414] text-white">ENG / USD</option>
                <option value="EUR" className="bg-[#141414] text-white">ENG / EUR</option>
                <option value="THB" className="bg-[#141414] text-white">TH / THB</option>
                <option value="GBP" className="bg-[#141414] text-white">ENG / GBP</option>
                <option value="JPY" className="bg-[#141414] text-white">JPN / JPY</option>
              </select>
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="header-mobile-toggle"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 text-[#888888] hover:text-white focus:outline-none"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Studio Divider */}
      <div className="w-full h-[1px] bg-[#222222]"></div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-[#0F0F0F] border-b border-[#222222] px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2 text-xs font-semibold tracking-wider">
            <a
              href="#shop"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 text-[#4FC1FF] bg-[#1A1A1A] rounded-lg"
            >
              SHOP (KEYBOARDS, SWITCHES, KEYCAPS)
            </a>
            <a
              href="#collections"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 text-[#AAAAAA] hover:text-white"
            >
              COLLECTIONS
            </a>
            <a
              href="#new-arrivals"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 text-[#AAAAAA] hover:text-white"
            >
              NEW ARRIVALS
            </a>
            <a
              href="#sale"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2 text-[#CE9178] hover:text-[#E5B5A1] font-bold font-mono"
            >
              SALE (20% OFF TITANKEYS)
            </a>
            <button
              onClick={() => {
                setMobileNavOpen(false);
                onOpenVsCodeGuide();
              }}
              className="w-full text-left px-3 py-2 text-[#D1D1D1] bg-[#141414] border border-[#222222] rounded-lg flex items-center gap-2 font-mono"
            >
              <Sparkles className="w-4 h-4 text-[#4FC1FF]" />
              VS Code Source Code Export
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
