import React, { useState } from 'react';
import {
  ShoppingBag, Lock, Package, Truck, CheckCircle2,
  X, Loader2, Star, ShieldCheck, Check, ArrowRight,
  Zap, AlertCircle, MapPin, Phone, MessageCircle,
} from 'lucide-react';
import { EscrowStatus } from '../context/StoreContext';
import { toast } from 'sonner';

// ─── Shared data type ────────────────────────────────────────────────────────
export interface TrackOrderData {
  id: string;
  productName: string;
  productImage: string;
  sellerName: string;
  total: number;
  escrowStatus: EscrowStatus;
  deliveryMethod: string;
  trackingNumber?: string;
  deliveryPartner?: string;
  date: string;
  address?: string;
  buyerName?: string;
  buyerPhone?: string;
  paymentMethod?: string;
}

// ─── Buyer step definitions ──────────────────────────────────────────────────
const BUYER_STEPS: {
  label: string;
  icon: React.ElementType;
  completedFor: EscrowStatus[];
  activeFor: EscrowStatus[];
}[] = [
  {
    label: 'Order Placed',
    icon: ShoppingBag,
    activeFor: ['awaiting_payment'],
    completedFor: ['payment_confirmed','funds_held','in_transit','delivery_confirmed','released'],
  },
  {
    label: 'Payment Secured',
    icon: Lock,
    activeFor: ['payment_confirmed'],
    completedFor: ['funds_held','in_transit','delivery_confirmed','released'],
  },
  {
    label: 'Seller Processing',
    icon: Package,
    activeFor: ['funds_held'],
    completedFor: ['in_transit','delivery_confirmed','released'],
  },
  {
    label: 'Out for Delivery',
    icon: Truck,
    activeFor: ['in_transit'],
    completedFor: ['delivery_confirmed','released'],
  },
  {
    label: 'Delivered',
    icon: CheckCircle2,
    activeFor: ['delivery_confirmed','released'],
    completedFor: [],
  },
];

// ─── Seller fulfillment step definitions ─────────────────────────────────────
const SELLER_STEPS: {
  label: string;
  sub: string;
  icon: React.ElementType;
  completedFor: EscrowStatus[];
  activeFor: EscrowStatus[];
  action?: { label: string; next: EscrowStatus };
}[] = [
  {
    label: 'Order Received',
    sub: 'New order, payment confirmed by buyer',
    icon: ShoppingBag,
    activeFor: ['payment_confirmed'],
    completedFor: ['funds_held','in_transit','delivery_confirmed','released'],
    action: { label: 'Accept Order', next: 'funds_held' },
  },
  {
    label: 'Order Accepted',
    sub: 'You accepted & confirmed the order',
    icon: Check,
    activeFor: [],
    completedFor: ['funds_held','in_transit','delivery_confirmed','released'],
  },
  {
    label: 'Pack & Prepare',
    sub: 'Prepare the items for dispatch',
    icon: Package,
    activeFor: ['funds_held'],
    completedFor: ['in_transit','delivery_confirmed','released'],
    action: { label: 'Confirm Dispatch', next: 'in_transit' },
  },
  {
    label: 'Dispatched',
    sub: 'Handed to delivery partner',
    icon: Truck,
    activeFor: ['in_transit'],
    completedFor: ['delivery_confirmed','released'],
  },
  {
    label: 'Delivered',
    sub: 'Buyer confirmed receipt',
    icon: CheckCircle2,
    activeFor: ['delivery_confirmed'],
    completedFor: ['released'],
    action: { label: 'Release Funds', next: 'released' },
  },
  {
    label: 'Funds Released',
    sub: 'Payment sent to your EcoCash wallet',
    icon: Zap,
    activeFor: ['released'],
    completedFor: [],
  },
];

type StepState = 'completed' | 'active' | 'upcoming';

function resolveState(
  completedFor: EscrowStatus[],
  activeFor: EscrowStatus[],
  status: EscrowStatus
): StepState {
  if (completedFor.includes(status)) return 'completed';
  if (activeFor.includes(status)) return 'active';
  return 'upcoming';
}

// ─── Mini 5-dot inline progress (for order cards) ─────────────────────────────
export function MiniTracker({ escrowStatus }: { escrowStatus: EscrowStatus }) {
  return (
    <div className="flex items-center gap-0">
      {BUYER_STEPS.map((step, idx) => {
        const state = resolveState(step.completedFor, step.activeFor, escrowStatus);
        const isLast = idx === BUYER_STEPS.length - 1;
        return (
          <React.Fragment key={step.label}>
            <div className="relative flex items-center justify-center rounded-full shrink-0"
              style={{
                width: state === 'active' ? 11 : 8,
                height: state === 'active' ? 11 : 8,
                background: state !== 'upcoming' ? '#009739' : '#e5e7eb',
                transition: 'all 0.25s',
              }}>
              {state === 'active' && (
                <span className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(0,151,57,0.35)' }} />
              )}
              {state === 'completed' && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />
              )}
            </div>
            {!isLast && (
              <div className="flex-1 h-0.5 min-w-[12px]"
                style={{ background: state === 'completed' ? '#009739' : '#e5e7eb' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step icon node (dot) ─────────────────────────────────────────────────────
function StepDot({ icon: Icon, state }: { icon: React.ElementType; state: StepState }) {
  if (state === 'completed') {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10"
        style={{ background: '#009739', boxShadow: '0 0 0 4px rgba(0,151,57,0.12)' }}>
        <Check className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (state === 'active') {
    return (
      <div className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10"
        style={{ background: '#009739', boxShadow: '0 0 0 4px rgba(0,151,57,0.18)' }}>
        <span className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: '#009739' }} />
        <Icon className="w-4 h-4 text-white relative z-10" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 bg-white"
      style={{ border: '2px solid #e5e7eb' }}>
      <Icon className="w-4 h-4 text-gray-300" />
    </div>
  );
}

// ─── Vertical connector between steps ────────────────────────────────────────
function StepConnector({ done }: { done: boolean }) {
  if (done) {
    return <div className="w-0.5 bg-[#009739]" style={{ marginLeft: 19, height: 28 }} />;
  }
  return (
    <div style={{ marginLeft: 19, height: 28, width: 2, backgroundImage: 'repeating-linear-gradient(to bottom, #d1d5db 0, #d1d5db 4px, transparent 4px, transparent 8px)' }} />
  );
}

// ─── Buyer Tracking Modal ─────────────────────────────────────────────────────
export function BuyerTrackingModal({
  order, onClose, onConfirmDelivery, onReview,
}: {
  order: TrackOrderData;
  onClose: () => void;
  onConfirmDelivery?: () => void;
  onReview?: () => void;
}) {
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleConfirm = async () => {
    setConfirmLoading(true);
    await new Promise(r => setTimeout(r, 1300));
    onConfirmDelivery?.();
    toast.success('Delivery confirmed!', { description: 'Funds released to seller. Thank you!' });
    setConfirmLoading(false);
    onClose();
  };

  // Active step index
  const activeIdx = BUYER_STEPS.findIndex(s => s.activeFor.includes(order.escrowStatus));
  const allDone = order.escrowStatus === 'released';

  // Per-step dynamic descriptions
  const stepDesc = (idx: number, state: StepState): string => {
    if (state === 'upcoming') return '';
    if (idx === 0) return `Placed on ${order.date}`;
    if (idx === 1) return `$${order.total.toFixed(2)} held securely in EcoCash Escrow`;
    if (idx === 2) return state === 'active' ? `${order.sellerName} is preparing your order` : `${order.sellerName} prepared your order`;
    if (idx === 3) return order.trackingNumber
      ? `${order.deliveryPartner ?? order.deliveryMethod} · ${order.trackingNumber}`
      : `${order.deliveryMethod} — en route`;
    if (idx === 4) return state === 'active' ? 'Please confirm you received the package below' : 'Order delivered & funds released';
    return '';
  };

  const ESCROW_BANNER: Record<EscrowStatus, { label: string; color: string; bg: string }> = {
    awaiting_payment:   { label: 'Awaiting your payment',               color: '#856404', bg: 'rgba(255,209,0,0.08)' },
    payment_confirmed:  { label: 'Payment confirmed — funds in escrow', color: '#009739', bg: 'rgba(0,151,57,0.06)' },
    funds_held:         { label: 'Funds held in escrow — seller packing', color: '#009739', bg: 'rgba(0,151,57,0.06)' },
    in_transit:         { label: 'Out for delivery — funds still in escrow', color: '#1e40af', bg: 'rgba(30,64,175,0.05)' },
    delivery_confirmed: { label: 'Delivered — confirm receipt to release funds', color: '#009739', bg: 'rgba(0,151,57,0.06)' },
    released:           { label: 'Complete — funds released to seller', color: '#009739', bg: 'rgba(0,151,57,0.06)' },
    disputed:           { label: 'Under dispute — our team is reviewing', color: '#CE1126', bg: 'rgba(206,17,38,0.05)' },
  };
  const banner = ESCROW_BANNER[order.escrowStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '94vh' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>Track Order</p>
            <p className="text-gray-400 font-mono mt-0.5" style={{ fontSize: '0.72rem' }}>#{order.id}</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── Product row ── */}
          <div className="px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-[68px] h-[68px] rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: '0.92rem' }}>{order.productName}</p>
                <p className="text-gray-400 text-xs mt-0.5">{order.sellerName}</p>
                <p className="text-gray-400 text-xs">{order.deliveryMethod} · {order.date}</p>
              </div>
              <p style={{ fontWeight: 900, fontSize: '1.1rem', color: '#009739', flexShrink: 0 }}>
                ${order.total.toFixed(2)}
              </p>
            </div>

            {/* Tracking number pill */}
            {order.trackingNumber && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="text-xs text-blue-700 font-mono" style={{ fontWeight: 600 }}>
                  {order.deliveryPartner} · {order.trackingNumber}
                </span>
              </div>
            )}
          </div>

          {/* ── Escrow banner ── */}
          <div className="mx-6 mt-4 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: banner.bg, border: `1px solid ${banner.color}28` }}>
            {order.escrowStatus === 'disputed'
              ? <AlertCircle className="w-4 h-4 shrink-0" style={{ color: banner.color }} />
              : <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: banner.color }} />
            }
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: banner.color }}>{banner.label}</p>
          </div>

          {/* ── 5-step buyer timeline ── */}
          <div className="px-6 pt-5 pb-4">
            {BUYER_STEPS.map((step, idx) => {
              const state = resolveState(step.completedFor, step.activeFor, order.escrowStatus);
              const isLast = idx === BUYER_STEPS.length - 1;
              const nextState = !isLast
                ? resolveState(BUYER_STEPS[idx + 1].completedFor, BUYER_STEPS[idx + 1].activeFor, order.escrowStatus)
                : null;
              const connectorDone = state === 'completed' && nextState !== 'upcoming';
              const desc = stepDesc(idx, state);

              return (
                <div key={step.label}>
                  <div className="flex items-start gap-4">
                    {/* Left col: dot */}
                    <StepDot icon={step.icon} state={state} />

                    {/* Right col: content */}
                    <div className={`flex-1 pt-1.5 min-w-0 ${state === 'upcoming' ? 'opacity-35' : ''}`}
                      style={{ paddingBottom: isLast ? 0 : 4 }}>

                      <div className="flex items-center gap-2">
                        <p style={{
                          fontSize: '0.88rem',
                          fontWeight: state === 'upcoming' ? 500 : 700,
                          color: state === 'upcoming' ? '#9ca3af' : '#111',
                        }}>
                          {step.label}
                        </p>
                        {state === 'active' && (
                          <span className="px-2 py-0.5 rounded-full text-white"
                            style={{ background: '#009739', fontSize: '0.6rem', fontWeight: 800 }}>
                            NOW
                          </span>
                        )}
                        {state === 'completed' && !allDone && (
                          <span className="text-[11px] text-[#009739]" style={{ fontWeight: 600 }}>✓</span>
                        )}
                      </div>

                      {desc && (
                        <p className="text-gray-500 mt-0.5 leading-relaxed"
                          style={{ fontSize: '0.75rem' }}>{desc}</p>
                      )}

                      {/* Special: escrow callout for step 1 (payment secured) */}
                      {idx === 1 && state !== 'upcoming' && (
                        <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                          style={{ background: 'rgba(0,151,57,0.07)', border: '1px solid rgba(0,151,57,0.15)', width: 'fit-content' }}>
                          <ShieldCheck className="w-3 h-3 text-[#009739]" />
                          <span style={{ fontSize: '0.68rem', color: '#009739', fontWeight: 700 }}>EcoCash Escrow Protected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isLast && <StepConnector done={connectorDone} />}
                </div>
              );
            })}
          </div>

          {/* ── Escrow explainer ── */}
          <div className="mx-6 mb-6 p-4 rounded-2xl"
            style={{ background: 'rgba(0,151,57,0.04)', border: '1px solid rgba(0,151,57,0.12)' }}>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#009739] shrink-0 mt-0.5" />
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111' }}>
                  Your money is safe
                </p>
                <p className="text-gray-500 mt-0.5 leading-relaxed" style={{ fontSize: '0.72rem' }}>
                  Funds are only released to {order.sellerName} after you confirm delivery. If your order never arrives, you get a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col gap-2">
          {order.escrowStatus === 'in_transit' && (
            <button onClick={handleConfirm} disabled={confirmLoading}
              className="w-full py-3 rounded-xl text-white text-sm cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              style={{ background: '#009739', fontWeight: 700 }}>
              {confirmLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                : <><CheckCircle2 className="w-4 h-4" /> I Received My Order</>}
            </button>
          )}

          {(order.escrowStatus === 'delivery_confirmed' || order.escrowStatus === 'released') && onReview && (
            <button onClick={() => { onClose(); setTimeout(onReview, 200); }}
              className="w-full py-3 rounded-xl text-sm cursor-pointer border-none flex items-center justify-center gap-2"
              style={{ background: '#FFD100', color: '#111', fontWeight: 700 }}>
              <Star className="w-4 h-4" /> Rate this order
            </button>
          )}

          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
            style={{ fontWeight: 600 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Seller Fulfillment Modal ─────────────────────────────────────────────────
export function SellerFulfillmentModal({
  order, onClose, onUpdateStatus,
}: {
  order: TrackOrderData;
  onClose: () => void;
  onUpdateStatus: (status: EscrowStatus) => void;
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (next: EscrowStatus, label: string) => {
    setLoadingAction(next);
    await new Promise(r => setTimeout(r, 900));
    onUpdateStatus(next);
    toast.success(`Order ${label}`, { description: `#${order.id} updated successfully` });
    setLoadingAction(null);
    onClose();
  };

  const ESCROW_SELLER_BANNER: Record<EscrowStatus, { label: string; color: string; bg: string }> = {
    awaiting_payment:   { label: 'Awaiting buyer payment',             color: '#856404', bg: 'rgba(255,209,0,0.08)' },
    payment_confirmed:  { label: 'Payment received — accept to start', color: '#1e40af', bg: 'rgba(30,64,175,0.06)' },
    funds_held:         { label: 'Accepted — pack & dispatch order',   color: '#856404', bg: 'rgba(255,209,0,0.08)' },
    in_transit:         { label: 'Dispatched — awaiting delivery',     color: '#009739', bg: 'rgba(0,151,57,0.06)' },
    delivery_confirmed: { label: 'Delivered — ready to release funds', color: '#009739', bg: 'rgba(0,151,57,0.06)' },
    released:           { label: 'Complete — funds sent to EcoCash',   color: '#009739', bg: 'rgba(0,151,57,0.06)' },
    disputed:           { label: 'Under dispute — contact support',    color: '#CE1126', bg: 'rgba(206,17,38,0.05)' },
  };
  const banner = ESCROW_SELLER_BANNER[order.escrowStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '94vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>Order Fulfillment</p>
            <p className="text-gray-400 font-mono mt-0.5" style={{ fontSize: '0.72rem' }}>#{order.id}</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Product row */}
          <div className="px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-[68px] h-[68px] rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: '0.92rem' }}>{order.productName}</p>
                <p className="text-gray-400 text-xs mt-0.5">{order.deliveryMethod} · {order.date}</p>
              </div>
              <p style={{ fontWeight: 900, fontSize: '1.1rem', color: '#009739', flexShrink: 0 }}>
                ${order.total.toFixed(2)}
              </p>
            </div>

            {/* Delivery info */}
            {(order.buyerName || order.address || order.buyerPhone) && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50 space-y-1.5">
                {order.buyerName && (
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-600" style={{ fontWeight: 600 }}>Ship to: {order.buyerName}</span>
                  </div>
                )}
                {order.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500">{order.address}</span>
                  </div>
                )}
                {order.buyerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500">{order.buyerPhone}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(order.buyerPhone!).catch(() => {}); toast.success('Number copied'); }}
                      className="text-[10px] text-[#009739] border-none bg-transparent cursor-pointer p-0 ml-1"
                      style={{ fontWeight: 600 }}>
                      Copy
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3 h-3 text-gray-400 shrink-0" />
                  <a
                    href={`https://wa.me/${(order.buyerPhone ?? '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#25D366] hover:underline"
                    style={{ fontWeight: 600 }}>
                    WhatsApp buyer
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Banner */}
          <div className="mx-6 mt-4 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: banner.bg, border: `1px solid ${banner.color}28` }}>
            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: banner.color }} />
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: banner.color }}>{banner.label}</p>
          </div>

          {/* ── 6-step seller timeline ── */}
          <div className="px-6 pt-5 pb-4">
            {SELLER_STEPS.map((step, idx) => {
              const state = resolveState(step.completedFor, step.activeFor, order.escrowStatus);
              const isLast = idx === SELLER_STEPS.length - 1;
              const nextState = !isLast
                ? resolveState(SELLER_STEPS[idx + 1].completedFor, SELLER_STEPS[idx + 1].activeFor, order.escrowStatus)
                : null;
              const connectorDone = state === 'completed' && nextState !== 'upcoming';

              return (
                <div key={step.label}>
                  <div className="flex items-start gap-4">
                    <StepDot icon={step.icon} state={state} />

                    <div className={`flex-1 pt-1.5 min-w-0 ${state === 'upcoming' ? 'opacity-35' : ''}`}
                      style={{ paddingBottom: 4 }}>
                      <div className="flex items-center gap-2">
                        <p style={{
                          fontSize: '0.88rem',
                          fontWeight: state === 'upcoming' ? 500 : 700,
                          color: state === 'upcoming' ? '#9ca3af' : '#111',
                        }}>
                          {step.label}
                        </p>
                        {state === 'active' && (
                          <span className="px-2 py-0.5 rounded-full text-white"
                            style={{ background: '#009739', fontSize: '0.6rem', fontWeight: 800 }}>
                            ACTION
                          </span>
                        )}
                        {state === 'completed' && (
                          <Check className="w-3.5 h-3.5 text-[#009739]" />
                        )}
                      </div>

                      {state !== 'upcoming' && (
                        <p className="text-gray-500 mt-0.5" style={{ fontSize: '0.75rem' }}>{step.sub}</p>
                      )}

                      {/* Action button for active steps */}
                      {state === 'active' && step.action && (
                        <button
                          onClick={() => handleAction(step.action!.next, step.action!.label)}
                          disabled={!!loadingAction}
                          className="mt-2.5 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs border-none cursor-pointer disabled:opacity-60 transition-colors"
                          style={{ background: '#009739', fontWeight: 700 }}>
                          {loadingAction === step.action.next
                            ? <><Loader2 className="w-3 h-3 animate-spin" /> Updating…</>
                            : <><ArrowRight className="w-3 h-3" /> {step.action.label}</>}
                        </button>
                      )}

                      {/* Awaiting buyer note for in_transit step */}
                      {state === 'active' && !step.action && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400"
                          style={{ fontWeight: 500 }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          Waiting for buyer to confirm delivery
                        </div>
                      )}
                    </div>
                  </div>

                  {!isLast && <StepConnector done={connectorDone} />}
                </div>
              );
            })}
          </div>

          {/* Escrow funds notice */}
          <div className="mx-6 mb-6 p-4 rounded-2xl"
            style={{ background: 'rgba(0,151,57,0.04)', border: '1px solid rgba(0,151,57,0.12)' }}>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#009739] shrink-0 mt-0.5" />
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111' }}>Escrow Balance: ${order.total.toFixed(2)}</p>
                <p className="text-gray-500 mt-0.5 leading-relaxed" style={{ fontSize: '0.72rem' }}>
                  Funds are released to your EcoCash wallet after the buyer confirms delivery. Msika deducts a 2% platform fee (${(order.total * 0.02).toFixed(2)}) — you receive ${(order.total * 0.98).toFixed(2)}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
            style={{ fontWeight: 600 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}