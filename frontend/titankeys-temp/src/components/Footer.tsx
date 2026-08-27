import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, Twitter, Facebook, Disc as DiscordIcon, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="w-full bg-[#070707] border-t border-[#1F1F1F] pt-14 pb-10 text-[#888888]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-14">
          
          {/* Column 1: SHOP */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-3.5 bg-[#4FC1FF] rounded-full inline-block"></span>
              <h3 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
                SHOP
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs font-medium tracking-wider font-mono">
              <li>
                <a href="#all" className="hover:text-white transition-colors uppercase">
                  ALL PRODUCTS
                </a>
              </li>
              <li>
                <a href="#keyboard" className="hover:text-[#4FC1FF] transition-colors uppercase text-[#D1D1D1]">
                  KEYBOARD
                </a>
              </li>
              <li>
                <a href="#headset" className="hover:text-white transition-colors uppercase">
                  HEADSET
                </a>
              </li>
              <li>
                <a href="#mouse" className="hover:text-white transition-colors uppercase">
                  MOUSE
                </a>
              </li>
              <li>
                <a href="#custom-keycap" className="hover:text-white transition-colors uppercase">
                  CUSTOM-KEYCAP
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: OUR COMPANY */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-3.5 bg-[#4EC9B0] rounded-full inline-block"></span>
              <h3 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
                OUR COMPANY
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs font-medium tracking-wider font-mono">
              <li>
                <a href="#about" className="hover:text-white transition-colors uppercase">
                  ABOUT US
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors uppercase">
                  CAREERS
                </a>
              </li>
              <li>
                <a href="#commitment" className="hover:text-white transition-colors uppercase">
                  OUR COMMITMENT
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: SUPPORT */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-3.5 bg-[#DCDCAA] rounded-full inline-block"></span>
              <h3 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
                SUPPORT
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs font-medium tracking-wider font-mono">
              <li>
                <a href="#faq" className="hover:text-white transition-colors uppercase">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#warranty" className="hover:text-white transition-colors uppercase">
                  WARRANTY POLICY
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: SUBSCRIBE TO THE VERSE */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-3.5 bg-[#CE9178] rounded-full inline-block"></span>
              <h3 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
                STUDIO DISPATCH
              </h3>
            </div>
            <p className="text-xs text-[#888888] mb-3.5 leading-relaxed">
              Join 18,000+ creators and get 15% off your first mechanical keyboard order.
            </p>

            {subscribed ? (
              <div className="p-3 bg-[#161616] border border-[#2D2D2D] rounded-xl text-xs text-[#4EC9B0] flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#4EC9B0]" />
                <span>Subscribed! Check your inbox for the promo code.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="newsletter-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@titankeys.io"
                    className="w-full px-3.5 py-2 bg-[#121212] border border-[#262626] rounded-lg text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#4FC1FF] transition-colors font-mono"
                  />
                </div>
                <button
                  id="newsletter-submit-button"
                  type="submit"
                  className="px-4 py-2 bg-[#0E639C] hover:bg-[#1177BB] text-white text-xs font-semibold tracking-wider uppercase rounded-lg transition-all cursor-pointer font-mono border border-[#1177BB]/40 shadow-sm"
                >
                  SUBMIT
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Studio Separator Line */}
        <div className="w-full h-[1px] bg-[#1C1C1C] mb-6"></div>

        {/* Bottom Bar with Copyright & Socials */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Copyright text */}
          <div className="text-[#666666] font-mono tracking-wide text-center sm:text-left">
            © 2025 TitanKeys Elite. ALL RIGHTS RESERVED.
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-3">
            <a
              href="#discord"
              aria-label="Discord community"
              className="w-8 h-8 rounded-lg bg-[#121212] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-[#4FC1FF] hover:border-[#333333] transition-all"
            >
              <DiscordIcon className="w-4 h-4" />
            </a>
            <a
              href="#twitter"
              aria-label="Twitter X profile"
              className="w-8 h-8 rounded-lg bg-[#121212] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-[#4FC1FF] hover:border-[#333333] transition-all"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="#facebook"
              aria-label="Facebook page"
              className="w-8 h-8 rounded-lg bg-[#121212] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-[#4FC1FF] hover:border-[#333333] transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="#community"
              aria-label="Community forum"
              className="w-8 h-8 rounded-lg bg-[#121212] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-[#4FC1FF] hover:border-[#333333] transition-all"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
