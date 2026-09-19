import React from 'react';
import { Layers, Shield, Scissors, Sparkles } from 'lucide-react';

export const BrandManifesto: React.FC = () => {
  return (
    <section id="about" className="w-full bg-neutral-950 border-b border-neutral-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">
            Brand Ethos // Craft Manifesto
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tighter uppercase mb-6 font-display">
            Built Heavy. <br />
            Engineered To Endure.
          </h2>
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
            Lord Knows was born from an obsession with garment weight, permanence, and brutalist tailoring. 
            We reject the disposable cadence of fast-fashion in favor of bespoke Portuguese cotton mills, 
            military-spec Japanese hardware, and limited numbered capsule drops.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-neutral-900/40 border border-neutral-800/90 rounded-xl p-6 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-white mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight mb-2 font-display">
              500 GSM Heavyweight
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              Custom-milled Portuguese loopback terry woven to substantial yarn density. Garments maintain structured drape season after season.
            </p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/90 rounded-xl p-6 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-white mb-4">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight mb-2 font-display">
              Architectural Tailoring
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              Engineered drop shoulders, reverse coverstitched side gussets, and articulated elbow darts designed around organic body movement.
            </p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/90 rounded-xl p-6 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-white mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight mb-2 font-display">
              Technical Hardware
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              German Fidlock magnetic snaps, matte oxidized YKK AquaGuard reverse zips, and Cordura ripstop reinforcements across high-abrasion zones.
            </p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/90 rounded-xl p-6 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-white mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight mb-2 font-display">
              Limited Batch Runs
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              Strictly limited numbers per colorway. No mass restocks. Once an archival silhouette is archived, it becomes part of the permanent canon.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
