import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-900 pt-16 pb-12 font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top brand signature */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          
          <div className="md:col-span-1 space-y-3">
            <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase block">
              Lord Knows
            </span>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Streetwear apparel studio producing heavyweight silhouettes, organic loopback fleece, and architectural tailoring in limited worldwide allocations.
            </p>
            <div className="text-[10px] text-neutral-600">
              OPERATING STUDIO // PORTO &amp; LOS ANGELES
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4 text-[11px]">
              Collection &amp; Drops
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  Drop 04: Sanctuary
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  Heavyweight Hoodies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  Articulated Bottoms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('lookbook')} className="hover:text-white transition-colors">
                  Archival Lookbook
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4 text-[11px]">
              Garment Studio &amp; Care
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <span className="hover:text-white cursor-pointer">500 GSM Care Manual</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Sizing &amp; Tailoring Specs</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Milling &amp; Supply Chain</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Authenticity Registry</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4 text-[11px]">
              Client Concierge
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-center space-x-1">
                <span>Worldwide Dispatch &amp; Customs</span>
              </li>
              <li>
                <span>14-Day Vault Returns</span>
              </li>
              <li className="text-amber-400">
                <span>vip@lordknows.studio</span>
              </li>
              <li className="flex items-center space-x-1 hover:text-white cursor-pointer pt-2">
                <span>Instagram Archive</span>
                <ArrowUpRight className="w-3 h-3" />
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-600">
          <div>
            &copy; {new Date().getFullYear()} LORD KNOWS STUDIO APPAREL. ALL RIGHTS RESERVED.
          </div>
          <div className="flex space-x-6 text-neutral-500">
            <span className="hover:text-neutral-400 cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-neutral-400 cursor-pointer">Terms of Allocation</span>
            <span className="hover:text-neutral-400 cursor-pointer">Cookie Settings</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
