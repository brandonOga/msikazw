import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useStore, PlacedOrder, DeliveryDetails } from '../context/StoreContext';
import {
  CheckCircle2, ChevronLeft, MapPin, Phone, User,
  ArrowRight, Loader2, Lock, Shield, Smartphone,
  Truck, UserCircle, Store, MessageCircle, Copy,
  Clock, Zap, Eye, ChevronDown, ChevronUp, Share2,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Payment methods ───────────────────────────────────────────────────────────
const paymentMethods = [
  { id: 'ecocash', label: 'EcoCash', sub: 'Instant mobile payment — most popular' },
  { id: 'onemoney', label: 'OneMoney', sub: 'NetOne mobile money' },
  { id: 'innbucks', label: 'Innbucks', sub: 'InnBucks wallet payment' },
  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive' },
  { id: 'bank', label: 'Bank Transfer', sub: 'EFT or ZIPIT' },
];

// ── Platform delivery partners ────────────────────────────────────────────────
const deliveryPartners = [
  { id: 'indrive', name: 'InDrive', est: '1-3 hours', price: 5, badge: 'Fastest' },
  { id: 'dhl', name: 'DHL', est: '1-2 business days', price: 3, badge: 'Reliable' },
  { id: 'tapgo', name: 'Tap & Go', est: '2-4 hours', price: 4, badge: 'Popular' },
];

// ── Radio card component ──────────────────────────────────────────────────────
function RadioCard({
  checked, onClick, label, sub, right, badge,
}: { checked: boolean; onClick: () => void; label: string; sub: string; right?: React.ReactNode; badge?: string }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3.5 rounded-lg cursor-pointer transition-all select-none relative"
      style={{ border: `1.5px solid ${checked ? '#009739' : '#e5e5e5'}`, background: checked ? '#f0faf4' : '#fff' }}
      role="radio"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {badge && (
        <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-white"
          style={{ fontSize: '0.6rem', fontWeight: 800, background: '#009739' }}>{badge}</span>
      )}
      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ border: `2px solid ${checked ? '#009739' : '#ccc'}` }}>
        {checked && <div className="w-2 h-2 rounded-full bg-[#009739]" />}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{label}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
      {right}
    </div>
  );
}

// ── EcoCash PIN Confirmation Modal ────────────────────────────────────────────
function EcoCashModal({
  phone, amount, onConfirm, onCancel, loading,
}: { phone: string; amount: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const submit = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) { setPinError('Enter your 4-digit EcoCash PIN'); return; }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-[#009739] px-6 py-5 text-center">
          <Smartphone className="w-8 h-8 text-white mx-auto mb-2" />
          <p className="text-white" style={{ fontWeight: 800, fontSize: '1rem' }}>EcoCash Payment</p>
          <p className="text-green-100 mt-0.5" style={{ fontSize: '0.8rem' }}>Escrow-protected transaction</p>
        </div>
        <div className="px-6 py-5">
          <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">EcoCash number</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>{phone || '+263 77 *** ****'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Amount</span>
              <span className="text-[#009739]" style={{ fontWeight: 700 }}>{amount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Held by</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>Msika Escrow</span>
            </div>
          </div>

          <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Enter EcoCash PIN *</label>
          <input
            type="password" inputMode="numeric" maxLength={4}
            value={pin} onChange={e => { setPin(e.target.value); setPinError(''); }}
            placeholder="• • • •"
            className="w-full text-center tracking-widest text-2xl py-3 rounded-lg border focus:outline-none focus:border-[#009739] transition-colors bg-gray-50"
            style={{ border: pinError ? '1.5px solid #CE1126' : '1.5px solid #e5e5e5', letterSpacing: '0.5em' }}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          {pinError && <p className="text-xs text-red-500 mt-1">{pinError}</p>}
          <p className="text-[11px] text-gray-400 mt-2 text-center">
            Demo: enter any 4 digits to confirm
          </p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm cursor-pointer bg-white hover:bg-gray-50 transition-colors"
              style={{ fontWeight: 600 }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-[#009739] text-white text-sm cursor-pointer hover:bg-[#007f30] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ fontWeight: 700 }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Processing…' : 'Confirm Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Driver Share Modal (WhatsApp) ─────────────────────────────────────────────
function DriverShareModal({
  orderId, pickupLocation, deliveryAddress, productSummary, onClose,
}: {
  orderId: string;
  pickupLocation: string;
  deliveryAddress: string;
  productSummary: string;
  onClose: () => void;
}) {
  const shareUrl = `${window.location.origin}/driver-tracking/${orderId}`;
  const message = encodeURIComponent(
    `📦 Msika Delivery Request\n\n` +
    `Order: #${orderId}\n` +
    `📍 Pickup: ${pickupLocation}\n` +
    `🏠 Deliver to: ${deliveryAddress}\n` +
    `📦 Items: ${productSummary}\n` +
    `💰 Payment: Secured in Escrow\n\n` +
    `Track & accept: ${shareUrl}`
  );

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    toast.success('Link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="px-6 py-5 text-center" style={{ background: '#25D366' }}>
          <MessageCircle className="w-8 h-8 text-white mx-auto mb-2" />
          <p className="text-white" style={{ fontWeight: 800, fontSize: '1rem' }}>Share with Driver</p>
          <p className="text-white/80 mt-0.5" style={{ fontSize: '0.8rem' }}>Send delivery details via WhatsApp</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#009739] shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500">Pickup</p>
                <p className="text-gray-900" style={{ fontWeight: 600 }}>{pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#CE1126] shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500">Deliver to</p>
                <p className="text-gray-900" style={{ fontWeight: 600 }}>{deliveryAddress}</p>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm no-underline"
            style={{ fontWeight: 700, background: '#25D366' }}
          >
            <MessageCircle className="w-4 h-4" /> Open WhatsApp
          </a>

          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm cursor-pointer bg-white hover:bg-gray-50 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Copy className="w-4 h-4" /> Copy Tracking Link
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-500 bg-transparent border-none cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generate 4-digit PIN ──────────────────────────────────────────────────────
function generatePIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ── Main checkout page ────────────────────────────────────────────────────────
export const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, user, formatPrice, addPlacedOrder } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'processing' | 'ecocash' | 'success'>('form');
  const [successOrder, setSuccessOrder] = useState<PlacedOrder | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('ecocash');

  // ── Delivery state ─────────────────────────────────────────────────
  const [deliveryOption, setDeliveryOption] = useState<'platform' | 'own_driver' | 'pickup'>('platform');
  const [selectedPartner, setSelectedPartner] = useState('indrive');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [showDriverOTP, setShowDriverOTP] = useState(false);
  const [driverOTP, setDriverOTP] = useState('');
  const [driverVerified, setDriverVerified] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.location || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showEcoCash, setShowEcoCash] = useState(false);
  const [ecoLoading, setEcoLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [expandDelivery, setExpandDelivery] = useState(true);

  // Pre-fill if user logs in mid-flow
  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: f.name || user.name, phone: f.phone || user.phone }));
  }, [user]);

  // Delivery cost calculation
  const getDeliveryCost = () => {
    if (deliveryOption === 'pickup') return 0;
    if (deliveryOption === 'own_driver') return 0;
    return deliveryPartners.find(p => p.id === selectedPartner)?.price ?? 5;
  };

  const deliveryFee = getDeliveryCost();
  const platformFee = cartTotal * 0.02;
  const grandTotal = cartTotal + deliveryFee + platformFee;

  const getDeliveryEstimate = () => {
    if (deliveryOption === 'pickup') return 'Ready for collection';
    if (deliveryOption === 'own_driver') return 'Depends on your driver';
    return deliveryPartners.find(p => p.id === selectedPartner)?.est ?? '1-3 hours';
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?[\d\s]{7,}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    if (deliveryOption !== 'pickup' && !form.address.trim()) e.address = 'Delivery address is required';
    if (deliveryOption === 'own_driver') {
      if (!driverName.trim()) e.driverName = 'Driver name is required';
      if (!driverPhone.trim()) e.driverPhone = 'Driver phone is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildOrder = (): PlacedOrder => {
    const pin = generatePIN();
    const partner = deliveryPartners.find(p => p.id === selectedPartner);
    const deliveryMethodLabel = deliveryOption === 'platform'
      ? `${partner?.name ?? 'InDrive'} Delivery`
      : deliveryOption === 'own_driver'
        ? 'Own Driver'
        : 'Store Pickup';

    const delivery: DeliveryDetails = {
      option: deliveryOption,
      partner: deliveryOption === 'platform'
        ? (partner?.name as 'DHL' | 'InDrive' | 'TapGo') ?? 'InDrive'
        : undefined,
      driver: deliveryOption === 'own_driver'
        ? { name: driverName, phone: driverPhone, verified: driverVerified }
        : undefined,
      pickupLocation: cart[0]?.product.sellerName ? `${cart[0].product.sellerName} Store, Harare` : 'Seller location',
      deliveryAddress: deliveryOption === 'pickup' ? undefined : form.address,
      estimatedTime: getDeliveryEstimate(),
      cost: deliveryFee,
      trackingStatus: 'order_confirmed',
      confirmationPIN: pin,
    };

    return {
      id: `MSK${Date.now().toString().slice(-6)}`,
      items: cart,
      total: grandTotal,
      status: 'confirmed',
      escrowStatus: selectedPayment === 'cod' ? 'awaiting_payment' : 'funds_held',
      paymentMethod: selectedPayment,
      deliveryMethod: deliveryMethodLabel,
      name: form.name,
      phone: form.phone,
      address: form.address,
      date: new Date().toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }),
      trackingNumber: selectedPayment !== 'cod'
        ? `${(partner?.name ?? 'MSK').toUpperCase()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        : undefined,
      deliveryPartner: deliveryOption === 'platform'
        ? (partner?.name as 'DHL' | 'InDrive') ?? 'InDrive'
        : deliveryOption === 'own_driver' ? 'Self' : 'Self',
      delivery,
      confirmationPIN: pin,
    };
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (selectedPayment === 'ecocash' || selectedPayment === 'innbucks' || selectedPayment === 'onemoney') {
      setShowEcoCash(true);
      return;
    }
    await processOrder();
  };

  const processOrder = async () => {
    setShowEcoCash(false);
    setStep('processing');
    await new Promise(r => setTimeout(r, 1800));
    const order = buildOrder();
    addPlacedOrder(order);
    clearCart();
    setSuccessOrder(order);
    setStep('success');
  };

  const handleEcoCashConfirm = async () => {
    setEcoLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setEcoLoading(false);
    await processOrder();
  };

  const handleVerifyDriver = () => {
    setShowDriverOTP(true);
    // Simulate OTP sent
    toast.success('OTP sent to driver', { description: `Verification code sent to ${driverPhone}` });
  };

  const handleConfirmDriverOTP = () => {
    if (driverOTP.length === 4) {
      setDriverVerified(true);
      setShowDriverOTP(false);
      toast.success('Driver verified!', { description: `${driverName} is now your delivery contact.` });
    }
  };

  if (cart.length === 0 && step === 'form') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <p className="text-3xl mb-3">🛒</p>
        <h2 className="text-xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>Cart is empty</h2>
        <Link to="/shop" className="px-5 py-2 bg-[#009739] text-white rounded-lg text-sm" style={{ fontWeight: 600 }}>
          Browse products
        </Link>
      </div>
    );
  }

  // ── Processing screen ──────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-[#009739] flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-7 h-7 text-[#009739] animate-spin" />
          </div>
          <p className="text-gray-900 mb-1" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Processing your order…</p>
          <p className="text-gray-500 text-sm">Securing funds in EcoCash escrow</p>
        </div>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 'success' && successOrder) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        {showShareModal && successOrder.delivery && (
          <DriverShareModal
            orderId={successOrder.id}
            pickupLocation={successOrder.delivery.pickupLocation || 'Seller location'}
            deliveryAddress={successOrder.delivery.deliveryAddress || successOrder.address || ''}
            productSummary={successOrder.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
            onClose={() => setShowShareModal(false)}
          />
        )}
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-md w-full shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#009739] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-2" style={{ fontWeight: 900 }}>Order placed!</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Your order has been confirmed and funds are held securely in escrow.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Order ID</span>
              <span className="text-gray-900 font-mono" style={{ fontWeight: 700 }}>#{successOrder.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Confirmed for</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>{successOrder.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total paid</span>
              <span className="text-[#009739]" style={{ fontWeight: 700 }}>${successOrder.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Delivery</span>
              <span className="text-gray-900" style={{ fontWeight: 600 }}>{successOrder.deliveryMethod}</span>
            </div>
            {successOrder.trackingNumber && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Tracking</span>
                <span className="text-blue-600 font-mono" style={{ fontWeight: 600 }}>{successOrder.trackingNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Escrow status</span>
              <span className="text-[#009739]" style={{ fontWeight: 700 }}>Funds held ✓</span>
            </div>
          </div>

          {/* Delivery confirmation PIN */}
          {successOrder.confirmationPIN && successOrder.delivery?.option !== 'pickup' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" style={{ color: '#856404' }} />
                <p className="text-sm" style={{ fontWeight: 700, color: '#856404' }}>Delivery PIN</p>
              </div>
              <p className="text-center text-3xl tracking-widest" style={{ fontWeight: 900, color: '#856404', letterSpacing: '0.3em' }}>
                {successOrder.confirmationPIN}
              </p>
              <p className="text-xs text-yellow-700 mt-2 text-center">
                Share this PIN with your driver at delivery to confirm receipt.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {/* Share with driver button for own_driver */}
            {successOrder.delivery?.option === 'own_driver' && (
              <button
                onClick={() => setShowShareModal(true)}
                className="py-2.5 rounded-xl text-white text-sm cursor-pointer border-none flex items-center justify-center gap-2"
                style={{ fontWeight: 700, background: '#25D366' }}
              >
                <MessageCircle className="w-4 h-4" /> Share with Driver via WhatsApp
              </button>
            )}
            <button
              onClick={() => navigate('/orders')}
              className="py-2.5 bg-[#009739] text-white rounded-xl text-sm cursor-pointer border-none"
              style={{ fontWeight: 700 }}
            >
              View my orders
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="py-2.5 bg-transparent text-[#009739] rounded-xl text-sm border-2 border-[#009739] cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white min-h-screen py-10">
      {showEcoCash && (
        <EcoCashModal
          phone={form.phone}
          amount={`$${grandTotal.toFixed(2)}`}
          onConfirm={handleEcoCashConfirm}
          onCancel={() => setShowEcoCash(false)}
          loading={ecoLoading}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl text-gray-900" style={{ fontWeight: 900 }}>Checkout</h1>
          <div className="flex items-center gap-1.5 ml-auto text-xs text-[#009739]" style={{ fontWeight: 600 }}>
            <Lock className="w-3.5 h-3.5" /> Escrow protected
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: forms */}
            <div className="lg:col-span-2 space-y-5">

              {/* Customer details */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-base text-gray-900 mb-4" style={{ fontWeight: 700 }}>Your details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Full name *</label>
                    <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                      <User className="w-4 h-4 text-gray-400" />
                      <input
                        type="text" value={form.name}
                        onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                        placeholder="Tatenda Moyo"
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Phone number *</label>
                    <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.phone ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                      <Phone className="w-4 h-4 text-gray-400" />
                      <input
                        type="tel" value={form.phone}
                        onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: '' })); }}
                        placeholder="+263 77 123 4567"
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  {deliveryOption !== 'pickup' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Delivery address *</label>
                      <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.address ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <input
                          type="text" value={form.address}
                          onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setErrors(er => ({ ...er, address: '' })); }}
                          placeholder="22 Samora Machel Ave, Harare"
                          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                        />
                      </div>
                      {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Delivery Method — 3-tier system ─────────────────────────── */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <button
                  type="button"
                  onClick={() => setExpandDelivery(!expandDelivery)}
                  className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer p-0"
                >
                  <h2 className="text-base text-gray-900" style={{ fontWeight: 700 }}>How do you want to receive your order?</h2>
                  {expandDelivery ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {expandDelivery && (
                  <div className="mt-4 space-y-4">
                    {/* 3 delivery options */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { key: 'platform' as const, icon: Truck, label: 'Delivery Partners', sub: 'InDrive, DHL, Tap & Go' },
                        { key: 'own_driver' as const, icon: UserCircle, label: 'Your Own Driver', sub: 'Share via WhatsApp' },
                        { key: 'pickup' as const, icon: Store, label: 'Pick Up', sub: 'Collect from shop' },
                      ].map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => { setDeliveryOption(opt.key); setDriverVerified(false); setDriverName(''); setDriverPhone(''); }}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all text-center"
                          style={{
                            borderColor: deliveryOption === opt.key ? '#009739' : '#e5e5e5',
                            background: deliveryOption === opt.key ? '#f0faf4' : '#fff',
                          }}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                              background: deliveryOption === opt.key ? 'rgba(0,151,57,0.15)' : '#f3f4f6',
                            }}>
                            <opt.icon className="w-5 h-5" style={{ color: deliveryOption === opt.key ? '#009739' : '#9ca3af' }} />
                          </div>
                          <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{opt.label}</p>
                          <p className="text-[11px] text-gray-400">{opt.sub}</p>
                        </button>
                      ))}
                    </div>

                    {/* Platform Delivery Partners */}
                    {deliveryOption === 'platform' && (
                      <div className="space-y-2 pt-2">
                        <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 600 }}>Choose a delivery partner:</p>
                        {deliveryPartners.map(p => (
                          <RadioCard
                            key={p.id}
                            checked={selectedPartner === p.id}
                            onClick={() => setSelectedPartner(p.id)}
                            label={p.name}
                            sub={`Est. ${p.est}`}
                            badge={p.badge}
                            right={
                              <span className="text-sm shrink-0" style={{ fontWeight: 700, color: '#111' }}>${p.price}</span>
                            }
                          />
                        ))}
                        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,151,57,0.06)', border: '1px solid rgba(0,151,57,0.15)' }}>
                          <Eye className="w-3.5 h-3.5 shrink-0" style={{ color: '#009739' }} />
                          <p style={{ fontSize: '0.72rem', color: '#007f30', fontWeight: 600 }}>
                            Transparent pricing — no hidden fees. Real-time tracking included.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Own Driver */}
                    {deliveryOption === 'own_driver' && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-gray-500" style={{ fontWeight: 600 }}>Add your driver's details:</p>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Driver name *</label>
                          <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.driverName ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                            <UserCircle className="w-4 h-4 text-gray-400" />
                            <input
                              type="text" value={driverName}
                              onChange={e => { setDriverName(e.target.value); setErrors(er => ({ ...er, driverName: '' })); }}
                              placeholder="e.g. Blessing Ndlovu"
                              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                            />
                          </div>
                          {errors.driverName && <p className="text-xs text-red-500 mt-1">{errors.driverName}</p>}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1" style={{ fontWeight: 600 }}>Driver phone number *</label>
                          <div className={`flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border transition-colors ${errors.driverPhone ? 'border-red-400' : 'border-gray-200 focus-within:border-[#009739]'}`}>
                            <Phone className="w-4 h-4 text-gray-400" />
                            <input
                              type="tel" value={driverPhone}
                              onChange={e => { setDriverPhone(e.target.value); setErrors(er => ({ ...er, driverPhone: '' })); setDriverVerified(false); }}
                              placeholder="+263 77 999 8888"
                              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
                            />
                          </div>
                          {errors.driverPhone && <p className="text-xs text-red-500 mt-1">{errors.driverPhone}</p>}
                        </div>

                        {/* OTP verification */}
                        {!driverVerified && driverPhone.length >= 7 && (
                          <div>
                            {!showDriverOTP ? (
                              <button
                                type="button"
                                onClick={handleVerifyDriver}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm cursor-pointer border-none text-white"
                                style={{ fontWeight: 700, background: '#009739' }}
                              >
                                <Shield className="w-4 h-4" /> Verify Driver Phone
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text" inputMode="numeric" maxLength={4}
                                  value={driverOTP}
                                  onChange={e => setDriverOTP(e.target.value)}
                                  placeholder="4-digit OTP"
                                  className="w-32 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-center bg-gray-50 focus:outline-none focus:border-[#009739]"
                                />
                                <button
                                  type="button"
                                  onClick={handleConfirmDriverOTP}
                                  className="px-4 py-2.5 rounded-lg text-sm cursor-pointer border-none text-white bg-[#009739]"
                                  style={{ fontWeight: 700 }}
                                >
                                  Confirm
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {driverVerified && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,151,57,0.06)', border: '1px solid rgba(0,151,57,0.15)' }}>
                            <CheckCircle2 className="w-4 h-4 text-[#009739] shrink-0" />
                            <p style={{ fontSize: '0.78rem', color: '#009739', fontWeight: 700 }}>
                              {driverName} verified ✓ — They'll receive order details after checkout
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,209,0,0.08)', border: '1px solid rgba(255,209,0,0.2)' }}>
                          <MessageCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#856404' }} />
                          <p style={{ fontSize: '0.72rem', color: '#856404', fontWeight: 600 }}>
                            After checkout, you can share the order link with your driver via WhatsApp.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pickup */}
                    {deliveryOption === 'pickup' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#f0faf4', border: '1px solid rgba(0,151,57,0.15)' }}>
                          <Store className="w-5 h-5 text-[#009739] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                              {cart[0]?.product.sellerName ?? 'Seller'} Store
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">Harare CBD, Zimbabwe</p>
                            <p className="text-xs text-[#009739] mt-1" style={{ fontWeight: 600 }}>
                              Seller will be notified instantly. Collection usually ready within 1 hour.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,151,57,0.06)', border: '1px solid rgba(0,151,57,0.15)' }}>
                          <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: '#009739' }} />
                          <p style={{ fontSize: '0.72rem', color: '#007f30', fontWeight: 600 }}>
                            No delivery cost — collect directly from the seller.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment method */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-base text-gray-900 mb-4" style={{ fontWeight: 700 }}>Payment method</h2>
                <div className="space-y-2">
                  {paymentMethods.map(m => (
                    <RadioCard
                      key={m.id}
                      checked={selectedPayment === m.id}
                      onClick={() => setSelectedPayment(m.id)}
                      label={m.label}
                      sub={m.sub}
                    />
                  ))}
                </div>
                {(selectedPayment === 'ecocash' || selectedPayment === 'onemoney' || selectedPayment === 'innbucks') && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,151,57,0.06)', border: '1px solid rgba(0,151,57,0.15)' }}>
                    <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: '#009739' }} />
                    <p style={{ fontSize: '0.72rem', color: '#007f30', fontWeight: 600 }}>
                      You'll be asked to confirm with your PIN before payment is processed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-20">
                <h2 className="text-base text-gray-900 mb-4" style={{ fontWeight: 700 }}>Order summary</h2>
                <div className="space-y-3 mb-4">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-2.5">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover shrink-0" loading="lazy" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900 truncate" style={{ fontWeight: 600 }}>{product.name}</p>
                        <p className="text-[11px] text-gray-500">{product.sellerName} · x{quantity}</p>
                      </div>
                      <span className="text-xs text-gray-900 shrink-0" style={{ fontWeight: 700 }}>${(product.price * quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900" style={{ fontWeight: 600 }}>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Platform fee (2%)</span>
                    <span className="text-gray-500">${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Delivery ({deliveryOption === 'pickup' ? 'Pickup' : deliveryOption === 'own_driver' ? 'Own driver' : deliveryPartners.find(p => p.id === selectedPartner)?.name})</span>
                    <span style={{ fontWeight: 600, color: deliveryFee === 0 ? '#009739' : '#111' }}>
                      {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Est. delivery</span>
                    <span className="text-gray-700 flex items-center gap-1" style={{ fontWeight: 600 }}>
                      <Clock className="w-3 h-3" /> {getDeliveryEstimate()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Total</span>
                    <span className="text-xl text-gray-900" style={{ fontWeight: 900 }}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust signals */}
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: 'rgba(0,151,57,0.04)', border: '1px solid rgba(0,151,57,0.12)' }}>
                  <Shield className="w-4 h-4 text-[#009739] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-900" style={{ fontWeight: 700 }}>Buyer Protection</p>
                    <p className="text-[11px] text-gray-500">Funds held in escrow until you confirm delivery.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl transition-colors text-sm border-none cursor-pointer"
                  style={{ fontWeight: 700 }}
                >
                  {selectedPayment === 'ecocash' || selectedPayment === 'onemoney' || selectedPayment === 'innbucks'
                    ? <><Smartphone className="w-4 h-4" /> Confirm via {selectedPayment === 'ecocash' ? 'EcoCash' : selectedPayment === 'onemoney' ? 'OneMoney' : 'Innbucks'}</>
                    : <><ArrowRight className="w-4 h-4" /> Place order</>
                  }
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  By placing your order you agree to our terms.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};