import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Flame, Compass } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onLookbookClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onLookbookClick
}) => {
  // Simulated Drop 04 Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 18, minutes: 42, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 border-b border-neutral-900">
      {/* Background Image with Streetwear Editorial Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=2000&auto=format&fit=crop"
          alt="Lord Knows Collection 04"
          className="w-full h-full object-cover object-center opacity-35 filter grayscale contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl">
          
          {/* Tagline Badge & Drop Status */}
          <div className="inline-flex items-center space-x-3 bg-neutral-900/90 border border-neutral-800 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-mono font-medium tracking-wider text-neutral-300 uppercase">
              AUTUMN / WINTER 2026 // DROP 04
            </span>
            <span className="text-neutral-600">|</span>
            <div className="flex items-center space-x-1 text-xs font-mono text-amber-300">
              <Flame className="w-3.5 h-3.5" />
              <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white uppercase leading-[0.95] mb-6 font-display">
            Sanctuary <br />
            <span className="text-neutral-500">&amp; Static.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed mb-8 max-w-xl font-normal">
            A brutalist apparel study in heavyweight Portuguese loopback terry, 
            engineered Japanese Cordura ripstops, and architectural garment proportions. 
            Strictly limited production runs.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-white text-neutral-950 font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-98 rounded cursor-pointer group shadow-xl shadow-black/50"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              id="hero-lookbook-btn"
              onClick={onLookbookClick}
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold text-xs uppercase tracking-widest transition-colors rounded cursor-pointer"
            >
              <Compass className="w-4 h-4 text-neutral-400" />
              <span>View Editorial Lookbook</span>
            </button>
          </div>

          {/* Garment Highlights Specs */}
          <div className="grid grid-cols-3 gap-4 pt-12 mt-12 border-t border-neutral-900 max-w-xl text-left">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">500 GSM</div>
              <div className="text-[11px] font-mono tracking-wider text-neutral-500 uppercase mt-0.5">Heavyweight Terry</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">100%</div>
              <div className="text-[11px] font-mono tracking-wider text-neutral-500 uppercase mt-0.5">Organic Combed Cotton</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white flex items-center space-x-1">
                <ShieldCheck className="w-5 h-5 text-neutral-400" />
                <span>PT / JP</span>
              </div>
              <div className="text-[11px] font-mono tracking-wider text-neutral-500 uppercase mt-0.5">Artisanal Milling</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
