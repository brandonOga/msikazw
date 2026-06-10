import React, { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  Package, ChevronRight, ShieldCheck, Star, X, Loader2,
  CheckCircle2, Clock, MapPin, Truck,
} from 'lucide-react';
import { useStore, PlacedOrder, EscrowStatus } from '../context/StoreContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  MiniTracker, BuyerTrackingModal, TrackOrderData,
} from '../components/OrderTracker';

// ─── Step label for mini display ──────────────────────────────────────────────
const STEP_LABEL: Record<EscrowStatus, string> = {
  awaiting_payment:   'Awaiting Payment',
  payment_confirmed:  'Payment Secured',
  funds_held:         'Seller Processing',
  in_transit:         'Out for Delivery',
  delivery_confirmed: 'Delivered',
  released:           'Complete',
  disputed:           'Under Dispute',
};

const STEP_COLOR: Record<EscrowStatus, { text: string; bg: string }> = {
  awaiting_payment:   { text: '#856404', bg: 'rgba(255,209,0,0.12)' },
  payment_confirmed:  { text: '#1e40af', bg: 'rgba(30,64,175,0.08)' },
  funds_held:         { text: '#856404', bg: 'rgba(255,209,0,0.12)' },
  in_transit:         { text: '#0369a1', bg: 'rgba(3,105,161,0.08)' },
  delivery_confirmed: { text: '#009739', bg: 'rgba(0,151,57,0.1)' },
  released:           { text: '#009739', bg: 'rgba(0,151,57,0.1)' },
  disputed:           { text: '#CE1126', bg: 'rgba(206,17,38,0.08)' },
};

// ─── Rate & Review Modal ──────────────────────────────────────────────────────
function ReviewModal({ productName, onClose }: { productName: string; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!rating) { toast.error('Please select a star rating'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
    toast.success('Review submitted! Thank you.');
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-yellow-500" fill="none" />
            </div>
            <p className="text-gray-900" style={{ fontWeight: 700 }}>Rate & Review</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-5">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-[#009739]" />
              </div>
              <p className="text-gray-900" style={{ fontWeight: 700 }}>Review submitted!</p>
              <p className="text-sm text-gray-500 mt-1">Thank you for your feedback.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4 truncate">{productName}</p>
              <div className="flex gap-2 justify-center mb-5">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} type="button"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(i)}
                    className="p-0 bg-transparent border-none cursor-pointer transition-transform hover:scale-110">
                    <Star className="w-9 h-9 transition-colors"
                      fill={(hovered || rating) >= i ? '#FFD100' : 'none'}
                      color={(hovered || rating) >= i ? '#FFD100' : '#d1d5db'} />
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Share your experience with other shoppers…" rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:border-[#009739] transition-colors bg-gray-50" />
              <button onClick={submit} disabled={loading}
                className="w-full mt-3 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
                style={{ fontWeight: 700 }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Review'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Placed Order Card (from StoreContext) ────────────────────────────────────
function PlacedOrderCard({ order }: { order: PlacedOrder }) {
  const { confirmDelivery, cancelOrder, reorder } = useStore();
  const navigate = useNavigate();
  const [showTracker, setShowTracker] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const firstItem = order.items[0];
  const sc = STEP_COLOR[order.escrowStatus] ?? STEP_COLOR.awaiting_payment;
  const stepLabel = STEP_LABEL[order.escrowStatus] ?? 'Processing';

  const handleConfirmDelivery = async () => {
    setConfirmLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    confirmDelivery(order.id);
    toast.success('Delivery confirmed!', { description: 'Funds released to seller.' });
    setConfirmLoading(false);
  };

  const trackData: TrackOrderData = {
    id: order.id,
    productName: firstItem?.product.name ?? 'Order',
    productImage: firstItem?.product.image ?? '',
    sellerName: firstItem?.product.sellerName ?? 'Seller',
    total: order.total,
    escrowStatus: order.escrowStatus,
    deliveryMethod: order.deliveryMethod,
    trackingNumber: order.trackingNumber,
    deliveryPartner: order.deliveryPartner,
    date: order.date,
    address: order.address,
    buyerName: order.name,
    buyerPhone: order.phone,
    paymentMethod: order.paymentMethod,
  };

  return (
    <>
      {showTracker && (
        <BuyerTrackingModal
          order={trackData}
          onClose={() => setShowTracker(false)}
          onConfirmDelivery={handleConfirmDelivery}
          onReview={() => setShowReview(true)}
        />
      )}
      {showReview && firstItem && (
        <ReviewModal productName={firstItem.product.name} onClose={() => setShowReview(false)} />
      )}

      <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {/* Main row */}
        <div className="p-5">
          <div className="flex items-start gap-3.5">
            {/* Product image */}
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer"
              onClick={() => firstItem && navigate(`/product/${firstItem.product.id}`)}>
              {firstItem && (
                <img src={firstItem.product.image} alt={firstItem.product.name}
                  className="w-full h-full object-cover" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    {firstItem?.product.name}
                    {order.items.length > 1 && (
                      <span className="text-gray-400 text-xs" style={{ fontWeight: 500 }}>
                        {' '}+{order.items.length - 1} more
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {firstItem?.product.sellerName} · #{order.id} · {order.date}
                  </p>
                </div>
                <p style={{ fontWeight: 900, fontSize: '1rem', color: '#009739', flexShrink: 0 }}>
                  ${order.total.toFixed(2)}
                </p>
              </div>

              {/* Mini tracker */}
              <div className="mt-3">
                <MiniTracker escrowStatus={order.escrowStatus} />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: sc.bg, color: sc.text, fontWeight: 700 }}>
                    {stepLabel}
                  </span>
                  {order.trackingNumber && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 font-mono" style={{ fontWeight: 500 }}>
                      <Truck className="w-3 h-3" /> {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="border-t border-[#EAEAEA] px-5 py-3 flex flex-wrap gap-2 items-center">
          {/* Primary action: Track Order */}
          <button onClick={() => setShowTracker(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#009739] hover:bg-[#007f30] text-white text-xs rounded-xl transition-colors border-none cursor-pointer"
            style={{ fontWeight: 700 }}>
            <Package className="w-3.5 h-3.5" /> Track Order
          </button>

          {/* Escrow */}
          <button onClick={() => navigate('/trust-center')}
            className="flex items-center gap-1.5 px-3 py-2 text-[#009739] text-xs rounded-xl border cursor-pointer bg-white hover:bg-green-50 transition-colors"
            style={{ borderColor: 'rgba(0,151,57,0.2)', fontWeight: 600 }}>
            <ShieldCheck className="w-3.5 h-3.5" /> Escrow
          </button>

          {/* Confirm delivery (if in transit) */}
          {order.status === 'in_transit' && (
            <button onClick={handleConfirmDelivery} disabled={confirmLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#009739] text-xs rounded-xl border cursor-pointer hover:bg-green-50 transition-colors disabled:opacity-60"
              style={{ borderColor: 'rgba(0,151,57,0.3)', fontWeight: 600 }}>
              {confirmLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Confirm Delivery
            </button>
          )}

          {/* Rate (if delivered) */}
          {order.status === 'delivered' && (
            <button onClick={() => setShowReview(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border-none cursor-pointer"
              style={{ background: '#FFD100', color: '#111', fontWeight: 600 }}>
              <Star className="w-3.5 h-3.5" /> Rate Order
            </button>
          )}

          {/* Reorder */}
          {order.status === 'delivered' && (
            <button
              onClick={() => { reorder(order.id); toast.info('Reorder requested'); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#009739] text-xs rounded-xl border border-[#009739] cursor-pointer hover:bg-green-50 transition-colors"
              style={{ fontWeight: 600 }}>
              Reorder
            </button>
          )}

          {/* Cancel */}
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <button
              onClick={() => { cancelOrder(order.id); toast.info('Cancellation requested'); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-red-500 text-xs rounded-xl border border-red-100 cursor-pointer hover:bg-red-50 transition-colors"
              style={{ fontWeight: 600 }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Legacy Order Card (kept for backwards compat, no longer used) ────────────
function MockOrderCard({ order }: { order: { id: string; productName: string; productImage: string; sellerName: string; price: number; quantity: number; escrowStatus: string; deliveryMethod: string; trackingNumber?: string; deliveryPartner?: string; date: string } }) {
  const navigate = useNavigate();
  const [showTracker, setShowTracker] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus>(order.escrowStatus as EscrowStatus);

  const sc = STEP_COLOR[escrowStatus] ?? STEP_COLOR.awaiting_payment;
  const stepLabel = STEP_LABEL[escrowStatus] ?? 'Processing';

  const trackData: TrackOrderData = {
    id: order.id,
    productName: order.productName,
    productImage: order.productImage,
    sellerName: order.sellerName,
    total: order.price * order.quantity,
    escrowStatus,
    deliveryMethod: order.deliveryMethod,
    trackingNumber: order.trackingNumber,
    deliveryPartner: order.deliveryPartner,
    date: order.date,
  };

  const handleConfirmDelivery = () => {
    setEscrowStatus('released');
    toast.success('Delivery confirmed!', { description: 'Funds released to seller.' });
  };

  return (
    <>
      {showTracker && (
        <BuyerTrackingModal
          order={trackData}
          onClose={() => setShowTracker(false)}
          onConfirmDelivery={escrowStatus === 'in_transit' ? handleConfirmDelivery : undefined}
          onReview={() => setShowReview(true)}
        />
      )}
      {showReview && (
        <ReviewModal productName={order.productName} onClose={() => setShowReview(false)} />
      )}

      <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="p-5">
          <div className="flex items-start gap-3.5">
            {/* Image */}
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer"
              onClick={() => navigate('/shop')}>
              <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-gray-900 truncate" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    {order.productName}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {order.sellerName} · Qty {order.quantity} · {order.date}
                  </p>
                </div>
                <p style={{ fontWeight: 900, fontSize: '1rem', color: '#009739', flexShrink: 0 }}>
                  ${(order.price * order.quantity).toFixed(2)}
                </p>
              </div>

              {/* Mini tracker */}
              <div className="mt-3">
                <MiniTracker escrowStatus={escrowStatus} />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: sc.bg, color: sc.text, fontWeight: 700 }}>
                    {stepLabel}
                  </span>
                  {order.trackingNumber && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 font-mono" style={{ fontWeight: 500 }}>
                      <Truck className="w-3 h-3" /> {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="border-t border-[#EAEAEA] px-5 py-3 flex flex-wrap gap-2 items-center">
          <button onClick={() => setShowTracker(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#009739] hover:bg-[#007f30] text-white text-xs rounded-xl transition-colors border-none cursor-pointer"
            style={{ fontWeight: 700 }}>
            <Package className="w-3.5 h-3.5" /> Track Order
          </button>

          <button onClick={() => navigate('/trust-center')}
            className="flex items-center gap-1.5 px-3 py-2 text-[#009739] text-xs rounded-xl border cursor-pointer bg-white hover:bg-green-50 transition-colors"
            style={{ borderColor: 'rgba(0,151,57,0.2)', fontWeight: 600 }}>
            <ShieldCheck className="w-3.5 h-3.5" /> Escrow
          </button>

          {(escrowStatus === 'delivery_confirmed' || escrowStatus === 'released') && (
            <button onClick={() => setShowReview(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border-none cursor-pointer"
              style={{ background: '#FFD100', color: '#111', fontWeight: 600 }}>
              <Star className="w-3.5 h-3.5" /> Rate Order
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: string }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-16 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-gray-200" />
      </div>
      <h3 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1rem' }}>No orders here</h3>
      <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
        {tab === 'active' ? 'No active orders right now.' : 'Your completed orders will show here.'}
      </p>
      <button onClick={() => navigate('/shop')}
        className="px-5 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors"
        style={{ fontWeight: 600 }}>
        Browse products
      </button>
    </div>
  );
}

// ─── Main Orders page ─────────────────────────────────────────────────────────
export function Orders() {
  const { placedOrders } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const allPlaced = [...placedOrders];

  const filteredPlaced = activeTab === 'all' ? allPlaced
    : activeTab === 'active' ? allPlaced.filter(o => ['pending','confirmed','in_transit'].includes(o.status))
    : allPlaced.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  const totalCount     = allPlaced.length;
  const activeCount    = allPlaced.filter(o => ['pending','confirmed','in_transit'].includes(o.status)).length;
  const deliveredCount = allPlaced.filter(o => o.status === 'delivered').length;

  const isEmpty = filteredPlaced.length === 0;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        <Breadcrumbs className="mb-6" crumbs={[{ label: 'My Orders' }]} />

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-gray-900" style={{ fontWeight: 900, fontSize: '1.6rem' }}>My Orders</h1>
          <button onClick={() => navigate('/shop')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors"
            style={{ fontWeight: 600 }}>
            Continue Shopping
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Orders', value: totalCount, color: '#111', icon: Package },
            { label: 'Active', value: activeCount, color: '#856404', icon: Clock },
            { label: 'Delivered', value: deliveredCount, color: '#009739', icon: CheckCircle2 },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white border border-[#EAEAEA] rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color === '#009739' ? 'rgba(0,151,57,0.08)' : color === '#856404' ? 'rgba(255,209,0,0.12)' : '#f3f4f6' }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: '1.3rem', fontWeight: 900, color }}>{value}</p>
                <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-[#EAEAEA] p-1 rounded-xl mb-5 w-fit" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'active', label: 'Active', count: activeCount },
            { key: 'completed', label: 'Completed', count: deliveredCount },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs transition-all border-none cursor-pointer"
              style={{
                background: activeTab === tab.key ? '#009739' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#9ca3af',
                fontWeight: activeTab === tab.key ? 700 : 500,
              }}>
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full"
                  style={{
                    background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                    color: activeTab === tab.key ? '#fff' : '#6b7280',
                    fontSize: '0.6rem', fontWeight: 700,
                  }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Order list */}
        {isEmpty ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="space-y-3">
            {filteredPlaced.map(order => (
              <PlacedOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Trust center link */}
        <div className="mt-8 p-4 rounded-2xl flex items-center gap-3"
          style={{ background: 'rgba(0,151,57,0.04)', border: '1px solid rgba(0,151,57,0.12)' }}>
          <ShieldCheck className="w-5 h-5 text-[#009739] shrink-0" />
          <div className="flex-1">
            <p className="text-gray-900" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Protected by EcoCash Escrow</p>
            <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>Your money is safe until you confirm delivery.</p>
          </div>
          <button onClick={() => navigate('/trust-center')}
            className="flex items-center gap-1 text-[#009739] text-xs bg-transparent border-none cursor-pointer shrink-0"
            style={{ fontWeight: 600 }}>
            Learn more <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}