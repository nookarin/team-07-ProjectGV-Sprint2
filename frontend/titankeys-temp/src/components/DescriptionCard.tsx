import React, { useState } from 'react';
import { Product } from '../types';
import { Shield, Layers, Wifi, Volume2, Package, Star, Award, Cpu } from 'lucide-react';

interface DescriptionCardProps {
  product: Product;
}

export const DescriptionCard: React.FC<DescriptionCardProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'features' | 'box' | 'reviews'>('overview');

  return (
    <div
      id="product-description-container"
      className="w-full rounded-2xl overflow-hidden bg-[#0F0F0F] border border-[#222222] shadow-xl"
    >
      {/* Top Description Banner in Studio Surface */}
      <div className="bg-[#141414] border-b border-[#222222] px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-heading">
          Description
        </h2>
        
        {/* Navigation pills inside description header */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-medium font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#222222] text-white border border-[#333333] shadow-sm'
                : 'text-[#888888] hover:text-[#D1D1D1] hover:bg-[#1A1A1A]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-[#222222] text-white border border-[#333333] shadow-sm'
                : 'text-[#888888] hover:text-[#D1D1D1] hover:bg-[#1A1A1A]'
            }`}
          >
            Tech Specs
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-[#222222] text-white border border-[#333333] shadow-sm'
                : 'text-[#888888] hover:text-[#D1D1D1] hover:bg-[#1A1A1A]'
            }`}
          >
            Features
          </button>
          <button
            onClick={() => setActiveTab('box')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'box'
                ? 'bg-[#222222] text-white border border-[#333333] shadow-sm'
                : 'text-[#888888] hover:text-[#D1D1D1] hover:bg-[#1A1A1A]'
            }`}
          >
            In The Box
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#222222] text-white border border-[#333333] shadow-sm'
                : 'text-[#888888] hover:text-[#D1D1D1] hover:bg-[#1A1A1A]'
            }`}
          >
            Reviews (★ 4.9)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Exact Paragraph from Screenshot */}
        <p className="text-[#CCCCCC] text-base sm:text-lg leading-relaxed font-normal">
          {product.description}
        </p>

        {/* Tab Specific Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#222222]">
            <div className="flex gap-3.5 p-4 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#333333] transition-colors">
              <div className="p-2.5 rounded-lg bg-[#1F1F1F] text-[#4FC1FF] shrink-0 h-fit border border-[#2D2D2D]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">QMK & VIA Programmable</h4>
                <p className="text-xs text-[#888888] leading-relaxed">
                  Remap any key, create multi-action macros, and customize the RGB lighting layer in real-time right through your web browser without installing bloatware.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 p-4 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#333333] transition-colors">
              <div className="p-2.5 rounded-lg bg-[#1F1F1F] text-[#4EC9B0] shrink-0 h-fit border border-[#2D2D2D]">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Instant 3-Device Bluetooth 5.2</h4>
                <p className="text-xs text-[#888888] leading-relaxed">
                  Switch between desktop rig, laptop, and iPad with FN+1/2/3 instant hotkeys. 1000Hz polling rate in 2.4GHz wireless mode ensures 0 lag in competitive gaming.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4FC1FF] font-mono mb-4">
              Comprehensive Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {product.specs.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between p-3 rounded-lg bg-[#141414] border border-[#222222]"
                >
                  <span className="text-[#888888] font-medium">{item.label}</span>
                  <span className="text-[#D1D1D1] font-mono text-right ml-2 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {product.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#141414] border border-[#222222] flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-[#1F1F1F] text-[#4FC1FF] shrink-0 border border-[#2D2D2D]">
                  {idx === 0 && <Shield className="w-4 h-4" />}
                  {idx === 1 && <Wifi className="w-4 h-4" />}
                  {idx === 2 && <Layers className="w-4 h-4" />}
                  {idx === 3 && <Volume2 className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">{feat.title}</h4>
                  <p className="text-xs text-[#888888] leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'box' && (
          <div className="pt-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4FC1FF] font-mono flex items-center gap-2">
              <Package className="w-4 h-4" />
              Included in the Retail Package
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.inTheBox.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-[#141414] rounded-xl border border-[#222222] text-xs font-mono text-[#CCCCCC]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4FC1FF]"></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl border border-[#222222]">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-extrabold text-white font-mono">4.9</div>
                <div>
                  <div className="flex text-[#DCDCAA] text-sm">
                    {'★★★★★'}
                  </div>
                  <div className="text-xs text-[#888888]">Based on 148 verified buyer ratings</div>
                </div>
              </div>
              <span className="text-xs px-3 py-1 bg-[#1A2A20] border border-[#4EC9B0]/40 text-[#4EC9B0] rounded-full font-semibold font-mono">
                100% Recommended
              </span>
            </div>

            <div className="space-y-3">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-[#141414] rounded-xl border border-[#222222] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{rev.author}</span>
                      {rev.verified && (
                        <span className="flex items-center gap-1 text-[10px] text-[#4FC1FF] font-medium bg-[#1F1F1F] border border-[#2D2D2D] px-2 py-0.5 rounded font-mono">
                          <Award className="w-3 h-3" />
                          Verified Owner
                        </span>
                      )}
                    </div>
                    <span className="text-[#666666] font-mono">{rev.date}</span>
                  </div>
                  <p className="text-xs text-[#AAAAAA] leading-relaxed italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
