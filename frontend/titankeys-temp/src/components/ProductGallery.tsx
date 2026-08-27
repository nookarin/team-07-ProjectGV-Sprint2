import React, { useState } from 'react';
import { ColorOption } from '../types';
import { Maximize2, Sparkles, Sliders, Zap } from 'lucide-react';

interface ProductGalleryProps {
  selectedColor: ColorOption;
  tags: string[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  selectedColor,
  tags,
}) => {
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [lightingEffect, setLightingEffect] = useState<'cyan' | 'purple' | 'matrix' | 'rainbow'>('cyan');
  const [isZoomed, setIsZoomed] = useState(false);

  // High quality realistic images for the different angles
  const galleryAngles = [
    {
      title: 'Full Cyber Setup',
      url: selectedColor.deskImage || 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=85',
      caption: 'Full anodized aluminum frame with South-facing RGB on desk'
    },
    {
      title: 'Top-Down Profile',
      url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=85',
      caption: 'Cherry profile PBT double-shot keycaps & CNC volume knob'
    },
    {
      title: 'Switch & Foam Mount',
      url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=85',
      caption: 'Hot-swappable 5-pin PCB with Poron gasket dampeners'
    },
    {
      title: 'Side Bevel & RGB',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85',
      caption: 'Aerospace-grade chamfered bezel with ambient side diffuser'
    }
  ];

  return (
    <div className="flex flex-col space-y-6">
      {/* Main Showcase Card with Studio Frame */}
      <div className="relative group rounded-2xl overflow-hidden bg-[#0F0F0F] border border-[#222222] p-2 sm:p-3 shadow-xl transition-all duration-300 hover:border-[#333333]">
        
        {/* Glow backdrop behind image */}
        <div
          className={`absolute inset-0 opacity-15 pointer-events-none transition-all duration-500 ${
            lightingEffect === 'cyan'
              ? 'bg-gradient-to-tr from-[#4FC1FF]/20 via-transparent to-[#007ACC]/10'
              : lightingEffect === 'purple'
              ? 'bg-gradient-to-tr from-[#C586C0]/20 via-transparent to-[#9333EA]/10'
              : lightingEffect === 'matrix'
              ? 'bg-gradient-to-tr from-[#4EC9B0]/20 via-transparent to-[#10B981]/10'
              : 'bg-gradient-to-tr from-[#CE9178]/20 via-[#C586C0]/15 to-[#4FC1FF]/20'
          }`}
        />

        {/* Top Badges over image */}
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#2D2D2D] text-[11px] font-semibold text-[#4FC1FF] rounded-full tracking-wider font-mono shadow-sm">
            <Zap className="w-3 h-3 text-[#4FC1FF] fill-[#4FC1FF]" />
            TRI-MODE 2.4G / BT
          </span>
          <span className="hidden sm:inline-flex px-2.5 py-1 bg-[#141414]/90 backdrop-blur-md border border-[#2A2A2A] text-[11px] font-mono text-[#DCDCAA] rounded-full">
            CNC 6063
          </span>
        </div>

        {/* Quick Zoom Action Button */}
        <button
          id="btn-expand-image"
          onClick={() => setIsZoomed(!isZoomed)}
          title="Zoom image view"
          className="absolute top-5 right-5 z-20 p-2 bg-[#0A0A0A]/85 hover:bg-[#1A1A1A] backdrop-blur-md text-[#AAAAAA] hover:text-white border border-[#2A2A2A] rounded-xl transition-all cursor-pointer shadow-md"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Main Image Stage */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9.5] w-full rounded-xl overflow-hidden bg-[#070707] flex items-center justify-center border border-[#1A1A1A]">
          <img
            id="product-main-showcase-image"
            src={galleryAngles[activeAngleIndex].url}
            alt="TitanKeys Elite Mechanical Keyboard"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center transition-all duration-700 transform ${
              isZoomed ? 'scale-125 cursor-zoom-out' : 'group-hover:scale-102 cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />

          {/* Bottom Overlay Info Tag */}
          <div className="absolute bottom-3 left-3 right-3 bg-[#0A0A0A]/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#222222] flex items-center justify-between text-xs text-[#CCCCCC]">
            <span className="font-normal text-[#D1D1D1] truncate">
              {galleryAngles[activeAngleIndex].title} — <span className="text-[#888888]">{galleryAngles[activeAngleIndex].caption}</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] text-[#4FC1FF] font-mono">
              LIGHT: {lightingEffect.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Thumbnail Selector & Lighting Modes Row */}
        <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto pb-1 pt-1">
          {/* Thumbnails */}
          <div className="flex items-center gap-2">
            {galleryAngles.map((angle, idx) => (
              <button
                key={idx}
                id={`gallery-thumb-${idx}`}
                onClick={() => setActiveAngleIndex(idx)}
                className={`relative w-14 h-11 sm:w-16 sm:h-12 rounded-lg overflow-hidden border transition-all cursor-pointer flex-shrink-0 ${
                  activeAngleIndex === idx
                    ? 'border-[#4FC1FF] ring-2 ring-[#4FC1FF]/30 scale-105'
                    : 'border-[#222222] opacity-60 hover:opacity-100 hover:border-[#333333]'
                }`}
              >
                <img
                  src={angle.url}
                  alt={angle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Lighting Preset switcher */}
          <div className="flex items-center gap-1.5 bg-[#141414] p-1.5 rounded-lg border border-[#222222] flex-shrink-0">
            <Sliders className="w-3 h-3 text-[#666666] ml-1 mr-0.5" />
            <button
              onClick={() => setLightingEffect('cyan')}
              title="Studio Ice Blue"
              className={`w-3.5 h-3.5 rounded-full bg-[#4FC1FF] transition-all cursor-pointer ${
                lightingEffect === 'cyan' ? 'ring-2 ring-white scale-110' : 'opacity-50'
              }`}
            />
            <button
              onClick={() => setLightingEffect('purple')}
              title="Violet Accent"
              className={`w-3.5 h-3.5 rounded-full bg-[#C586C0] transition-all cursor-pointer ${
                lightingEffect === 'purple' ? 'ring-2 ring-white scale-110' : 'opacity-50'
              }`}
            />
            <button
              onClick={() => setLightingEffect('matrix')}
              title="Emerald Monokai"
              className={`w-3.5 h-3.5 rounded-full bg-[#4EC9B0] transition-all cursor-pointer ${
                lightingEffect === 'matrix' ? 'ring-2 ring-white scale-110' : 'opacity-50'
              }`}
            />
            <button
              onClick={() => setLightingEffect('rainbow')}
              title="Warm Spectrum"
              className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#CE9178] via-[#C586C0] to-[#4FC1FF] transition-all cursor-pointer ${
                lightingEffect === 'rainbow' ? 'ring-2 ring-white scale-110' : 'opacity-50'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Tags: [KEYBOARD] [BLUETOOTH] [WIRELESS] */}
      <div className="flex items-center gap-3 flex-wrap">
        {tags.map((tag, idx) => (
          <div
            key={idx}
            id={`product-tag-${tag.toLowerCase()}`}
            className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#333333] rounded-lg text-xs font-mono font-medium text-[#AAAAAA] hover:text-[#FFFFFF] tracking-wider transition-all duration-200 cursor-default shadow-sm"
          >
            [{tag}]
          </div>
        ))}
      </div>
    </div>
  );
};
