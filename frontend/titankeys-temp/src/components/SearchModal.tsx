import React, { useState } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSelectProduct: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  product,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const sampleResults = [
    {
      title: 'TitanKeys Elite (Cyber Edition)',
      category: 'Mechanical Keyboards',
      price: '$399',
      tag: 'Best Seller',
    },
    {
      title: 'Titan Cyber Switch Set (90x)',
      category: 'Switches',
      price: '$65',
      tag: 'Hot Item',
    },
    {
      title: 'Neon Cyberpunk PBT Keycaps Set',
      category: 'Keycaps',
      price: '$79',
      tag: 'New',
    },
    {
      title: 'GearVerse Precision Gaming Mouse',
      category: 'Mouse',
      price: '$129',
      tag: 'In Stock',
    },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-4 border-b border-[#222222] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#4FC1FF]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keyboards, switches, keycaps, studio accessories..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#666666] focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-white rounded-lg hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick tags */}
        <div className="px-4 py-2.5 bg-[#161616] border-b border-[#222222] flex items-center gap-2 text-xs overflow-x-auto">
          <span className="text-[#777777] font-bold uppercase text-[10px] font-mono">Popular:</span>
          {['TitanKeys', 'Wireless 75%', 'Linear Red', 'PBT Keycaps', 'CNC 6063'].map((tag, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-0.5 rounded-md bg-[#1F1F1F] text-[#CCCCCC] hover:text-white hover:bg-[#282828] border border-[#2D2D2D] cursor-pointer font-mono text-[11px] transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-1">
          {sampleResults.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectProduct();
                onClose();
              }}
              className="p-3 rounded-xl hover:bg-[#1A1A1A] flex items-center justify-between cursor-pointer group transition-colors border border-transparent hover:border-[#262626]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] border border-[#2D2D2D] flex items-center justify-center text-[#4FC1FF]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-[#4FC1FF] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#888888] font-mono">{item.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#4FC1FF]">{item.price}</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#1F1F1F] text-[#AAAAAA] rounded font-mono border border-[#2D2D2D]">
                  {item.tag}
                </span>
                <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-[#4FC1FF] group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}

          {sampleResults.length === 0 && (
            <div className="text-center py-8 text-sm text-[#888888]">
              No products found for "{query}". Try searching for "TitanKeys" or "Keyboard".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
