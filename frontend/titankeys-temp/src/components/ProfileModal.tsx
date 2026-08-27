import React from 'react';
import { X, User, Package, Heart, Settings, LogOut, Shield } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden z-10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-[#4FC1FF] font-bold text-lg font-heading">
              TK
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Studio Enthusiast</h3>
              <p className="text-xs text-[#888888] font-mono">alex@titankeys.io • Level 4 Collector</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-white rounded-lg hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Status Card */}
        <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#4FC1FF] uppercase tracking-wider font-mono">Titan Studio VIP Member</div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">850 Studio Points</div>
          </div>
          <span className="px-2.5 py-1 bg-[#222222] text-[#DCDCAA] text-xs font-semibold rounded-lg border border-[#333333] font-mono">
            Tier Gold
          </span>
        </div>

        {/* Profile Menu links */}
        <div className="space-y-1 text-sm font-medium">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1A1A1A] text-[#CCCCCC] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[#262626]">
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-[#4FC1FF]" />
              <span>Order History & Tracking</span>
            </div>
            <span className="text-xs bg-[#1E1E1E] px-2 py-0.5 rounded text-[#4EC9B0] font-mono border border-[#2D2D2D]">2 Active</span>
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1A1A1A] text-[#CCCCCC] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[#262626]">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-[#CE9178]" />
              <span>Saved Studio Wishlist</span>
            </div>
            <span className="text-xs text-[#888888] font-mono">1 Item</span>
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1A1A1A] text-[#CCCCCC] hover:text-white transition-colors cursor-pointer border border-transparent hover:border-[#262626]">
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-[#888888]" />
              <span>Account Settings & Shipping Address</span>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#1C1C1C] hover:bg-[#252525] text-[#CCCCCC] hover:text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer border border-[#2D2D2D]"
        >
          Close
        </button>
      </div>
    </div>
  );
};
