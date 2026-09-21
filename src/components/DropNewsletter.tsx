import React, { useState } from 'react';
import { Mail, Check, Bell } from 'lucide-react';

export const DropNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email || phone) {
      setSubmitted(true);
    }
  };

  return (
    <section id="vip" className="w-full bg-neutral-950 border-b border-neutral-900 py-20 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-neutral-900 rounded-full filter blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="inline-flex items-center space-x-2 bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1 mb-4 text-xs font-mono text-amber-400">
          <Bell className="w-3.5 h-3.5" />
          <span>EARLY ACCESS DISPATCH LIST</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tighter uppercase mb-4 font-display">
          Never Miss A Drop.
        </h2>

        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto mb-8 font-normal">
          Allocations sell out within hours. Subscribers receive private pre-access codes 
          30 minutes before public site launch and priority allocation on limited capsule runs.
        </p>

        {submitted ? (
          <div className="bg-neutral-900 border border-emerald-500/30 rounded-lg p-6 max-w-md mx-auto text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase font-mono">You're On The VIP Dispatch</h4>
            <p className="text-xs text-neutral-400 font-mono">
              Watch your inbox for Drop 04 private portal access codes and secret restock notifications.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
              />
            </div>
            
            <div className="flex gap-2">
              <input
                id="newsletter-phone"
                type="tel"
                placeholder="Mobile (Optional for SMS drop alerts)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
              />
              <button
                id="newsletter-submit-btn"
                type="submit"
                className="px-6 py-3 bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Join List
              </button>
            </div>

            <p className="text-[11px] font-mono text-neutral-500 mt-2">
              By subscribing, you agree to receive studio dispatch updates. Unsubscribe anytime.
            </p>
          </form>
        )}

      </div>
    </section>
  );
};
