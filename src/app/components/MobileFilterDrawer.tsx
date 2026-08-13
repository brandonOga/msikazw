import React from 'react';
import { X } from 'lucide-react';

export function MobileFilterDrawer({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.45)', opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl flex flex-col transition-transform duration-300"
        style={{ maxHeight: '80vh', transform: isOpen ? 'translateY(0)' : 'translateY(100%)', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>Filters & Sort</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">{children}</div>
      </div>
    </>
  );
}
