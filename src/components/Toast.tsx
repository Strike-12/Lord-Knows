import React from 'react';
import { CheckCircle2, Heart, ShoppingBag, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'cart' | 'wishlist' | 'info';
  title: string;
  subtitle?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-neutral-900 border border-neutral-700 text-white rounded-lg shadow-2xl p-4 flex items-center space-x-3 max-w-sm">
        {toast.type === 'cart' && (
          <div className="p-2 bg-neutral-800 text-white rounded-md">
            <ShoppingBag className="w-4 h-4" />
          </div>
        )}
        {toast.type === 'wishlist' && (
          <div className="p-2 bg-rose-950/80 text-rose-400 rounded-md">
            <Heart className="w-4 h-4 fill-current" />
          </div>
        )}
        {toast.type === 'info' && (
          <div className="p-2 bg-neutral-800 text-emerald-400 rounded-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono truncate">{toast.title}</h4>
          {toast.subtitle && (
            <p className="text-[11px] text-neutral-400 font-mono truncate">{toast.subtitle}</p>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="text-neutral-500 hover:text-white p-1"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
