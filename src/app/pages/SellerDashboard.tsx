import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '../context/StoreContext';
import {
  LayoutDashboard, Package, ShoppingBag, Wallet, TrendingUp,
  UserCircle, Plus, Edit2, Search, Bell, ChevronRight,
  ArrowUpRight, Zap, Check, ShieldCheck, X, RefreshCw, Loader2,
  Trash2, Truck, BarChart2, DollarSign,
  AlertCircle, ArrowRight, ExternalLink,
  LayoutGrid, List, CheckCircle2,
  MoreVertical, Eye, Camera, MapPin, Phone, MessageCircle,
  Globe, Store, Star, BadgeCheck, ImageIcon, Upload,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { categories } from '../data/mockData';
import { Product } from '../data/mockData';
import { EscrowStatus } from '../context/StoreContext';
import { toast } from 'sonner';
import { SellerFulfillmentModal, TrackOrderData } from '../components/OrderTracker';
import { uploadProductImage, uploadSellerImage } from '../../lib/storage';
import { isSupabaseConfigured } from '../../lib/supabase';
import { fetchSellerOrders, type SellerOrderItem } from '../../lib/db/orders';
import * as ordersDb from '../../lib/db/orders';
import { fetchSellerById, updateSeller } from '../../lib/db/sellers';
import { SELLER_HEADER_H } from '../DashboardLayout';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'products' | 'orders' | 'payments' | 'analytics' | 'profile';
type Order = SellerOrderItem;

// ─── Constants ────────────────────────────────────────────────────────────────
const ESCROW_META: Record<string, { bg: string; text: string; label: string; step: number }> = {
  awaiting_payment:  { bg: '#FFF3CD', text: '#856404', label: 'Awaiting Payment', step: 0 },
  payment_confirmed: { bg: '#CCE5FF', text: '#004085', label: 'Payment Confirmed', step: 1 },
  funds_held:        { bg: 'rgba(255,209,0,0.15)', text: '#856404', label: 'Pack & Ship', step: 2 },
  in_transit:        { bg: '#CCE5FF', text: '#004085', label: 'In Transit', step: 3 },
  delivery_confirmed:{ bg: 'rgba(0,151,57,0.12)', text: '#009739', label: 'Delivered', step: 4 },
  released:          { bg: 'rgba(0,151,57,0.15)', text: '#007f30', label: 'Paid Out', step: 5 },
  disputed:          { bg: '#F8D7DA', text: '#842029', label: 'Disputed', step: -1 },
};

const STATUS_FLOW = [
  'awaiting_payment', 'payment_confirmed', 'funds_held',
  'in_transit', 'delivery_confirmed', 'released',
];

// Revenue and category data are computed from real orders below (inside the component)

// ─── Shared atoms ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const m = ESCROW_META[status] ?? ESCROW_META.awaiting_payment;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: m.bg, color: m.text, fontSize: '0.68rem', fontWeight: 700 }}>
      {m.label}
    </span>
  );
}

// ─── Product Modal ────────────────────────────────────────────────────────────
function ProductModal({ product, onSave, onClose, userId }: {
  product?: Product; onSave: (d: Omit<Product, 'id'>) => void; onClose: () => void; userId?: string;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '', description: product?.description || '',
    price: product?.price?.toString() || '', originalPrice: product?.originalPrice?.toString() || '',
    category: product?.category || '',
    inStock: product?.inStock ?? true, isDeal: product?.isDeal ?? false, isNew: product?.isNew ?? true,
    deliveryBadge: product?.deliveryBadge || 'Same-Day Delivery',
    paymentMethods: product?.paymentMethods || ['EcoCash'],
    sellerId: '', sellerName: '',
    rating: product?.rating || 4.5, reviewCount: product?.reviewCount || 0,
    reviews: product?.reviews || [], images: product?.images || [],
    tags: product?.tags?.join(', ') || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.price || isNaN(+form.price) || +form.price <= 0) e.price = 'Valid price required';
    if (!form.category) e.category = 'Select a category';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    const remaining = 8 - form.images.length;
    const toUpload = files.slice(0, remaining);
    if (!isSupabaseConfigured || !userId) {
      const urls = toUpload.map(f => URL.createObjectURL(f));
      setForm(f => ({ ...f, images: [...f.images, ...urls] }));
      return;
    }
    setGalleryUploading(true);
    const results = await Promise.all(toUpload.map(file => uploadProductImage(userId, file)));
    setGalleryUploading(false);
    const uploaded = results.filter(r => r.url).map(r => r.url as string);
    const failed = results.filter(r => r.error);
    if (failed.length) toast.error(`${failed.length} image(s) failed to upload`);
    if (uploaded.length) setForm(f => ({ ...f, images: [...f.images, ...uploaded] }));
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    await uploadFiles(files);
  };

  const removeGalleryImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const moveImage = (from: number, to: number) => {
    setForm(f => {
      const imgs = [...f.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...f, images: imgs };
    });
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    const img = form.images[0] || 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80';
    onSave({
      name: form.name.trim(), description: form.description.trim(),
      price: +form.price, originalPrice: form.originalPrice ? +form.originalPrice : undefined,
      category: form.category, image: img, images: form.images,
      inStock: form.inStock, isDeal: form.isDeal, isNew: form.isNew,
      deliveryBadge: form.deliveryBadge, paymentMethods: form.paymentMethods,
      sellerId: form.sellerId, sellerName: form.sellerName,
      rating: form.rating, reviewCount: form.reviewCount, reviews: form.reviews,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setSaving(false);
    toast.success(isEdit ? 'Product updated!' : 'Product added to your store!');
    onClose();
  };

  const F = (key: string, label: string, placeholder: string, type = 'text', req = false) => (
    <div>
      <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input type={type} value={(form as any)[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); }}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#009739] transition-colors bg-gray-50 ${(errors as any)[key] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
      />
      {(errors as any)[key] && <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{(errors as any)[key]}</p>}
    </div>
  );

  const MediaUploader = () => (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className="rounded-xl border-2 border-dashed transition-colors overflow-hidden"
      style={{ borderColor: dragOver ? '#009739' : '#D1D5DB', background: dragOver ? 'rgba(0,151,57,0.03)' : '#FAFAFA' }}
    >
      {form.images.length === 0 ? (
        <label className="flex flex-col items-center justify-center gap-3 py-10 cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            {galleryUploading ? <Loader2 className="w-6 h-6 text-[#009739] animate-spin" /> : <ImageIcon className="w-6 h-6 text-gray-400" />}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">{galleryUploading ? 'Uploading…' : 'Add media'}</p>
            <p className="text-xs text-gray-400 mt-0.5">or drop files to upload</p>
          </div>
          {!galleryUploading && (
            <span className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:border-[#009739] hover:text-[#009739] transition-colors">
              Add files
            </span>
          )}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={galleryUploading} />
        </label>
      ) : (
        <div className="p-3">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {form.images.map((url, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-100 group" style={{ aspectRatio: '1' }}>
                <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                {idx === 0 && <span className="absolute top-1 left-1 bg-gray-900/70 text-white rounded px-1.5 py-0.5 text-[9px] font-bold leading-none">Featured</span>}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  {idx > 0 && <button type="button" onClick={() => moveImage(idx, idx - 1)} className="w-6 h-6 rounded-full bg-white/90 text-gray-700 flex items-center justify-center border-none text-xs font-bold">‹</button>}
                  <button type="button" onClick={() => removeGalleryImage(idx)} className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center border-none"><X className="w-3 h-3" /></button>
                  {idx < form.images.length - 1 && <button type="button" onClick={() => moveImage(idx, idx + 1)} className="w-6 h-6 rounded-full bg-white/90 text-gray-700 flex items-center justify-center border-none text-xs font-bold">›</button>}
                </div>
              </div>
            ))}
          </div>
          {form.images.length < 8 ? (
            <label className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-[#009739] hover:text-[#009739] cursor-pointer transition-colors bg-white">
              {galleryUploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading…</> : <><Upload className="w-3.5 h-3.5" />Add more</>}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={galleryUploading} />
            </label>
          ) : <p className="text-xs text-gray-400 text-center">Maximum 8 images reached</p>}
        </div>
      )}
    </div>
  );

  const Toggle = ({ k, label }: { k: string; label: string }) => (
    <div
      className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 cursor-pointer select-none"
      onClick={() => setForm(f => ({ ...f, [k]: !(f as any)[k] }))}
    >
      <span className="text-sm text-gray-700">{label}</span>
      <div className="w-10 h-5 rounded-full transition-colors relative shrink-0" style={{ background: (form as any)[k] ? '#009739' : '#d1d5db' }}>
        <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm transition-all duration-200" style={{ left: (form as any)[k] ? '22px' : '2px' }} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-[#F6F6F7] rounded-2xl w-full shadow-2xl flex flex-col" style={{ maxWidth: '900px', maxHeight: '94vh' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 rounded-t-2xl shrink-0">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? 'Edit product' : 'Add product'}</h2>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
              Discard
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#009739] hover:bg-[#007f30] text-white text-sm font-bold cursor-pointer border-none disabled:opacity-60 flex items-center gap-2 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Save'}
            </button>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 p-4">

            {/* ── Left column ── */}
            <div className="space-y-4">

              {/* Title & Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Title<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                    placeholder="e.g. Wireless Earbuds Pro"
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#009739] transition-colors bg-white ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Description<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(er => ({ ...er, description: '' })); }}
                    placeholder="Describe your product…"
                    rows={4}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#009739] bg-white resize-none transition-colors ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
                </div>
              </div>

              {/* Media */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Media</h3>
                  {form.images.length > 0 && <span className="text-xs text-gray-400">{form.images.length}/8 · first is featured</span>}
                </div>
                <MediaUploader />
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP · Max 5 MB each</p>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price (USD)<span className="text-red-500 ml-0.5">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                      <input type="number" value={form.price} min="0" step="0.01"
                        onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setErrors(er => ({ ...er, price: '' })); }}
                        placeholder="0.00"
                        className={`w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#009739] bg-white transition-colors ${errors.price ? 'border-red-400' : 'border-gray-200'}`}
                      />
                    </div>
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Compare-at price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                      <input type="number" value={form.originalPrice} min="0" step="0.01"
                        onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#009739] bg-white transition-colors"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Shows a strikethrough original price</p>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Shipping</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delivery option</label>
                  <select value={form.deliveryBadge} onChange={e => setForm(f => ({ ...f, deliveryBadge: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#009739] bg-white">
                    {['Same-Day Delivery', 'Free Delivery', 'Home Delivery', 'Standard Delivery'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-4">

              {/* Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status</h3>
                <div>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setForm(f => ({ ...f, inStock: !f.inStock }))}
                  >
                    <div className="w-10 h-5 rounded-full transition-colors relative shrink-0" style={{ background: form.inStock ? '#009739' : '#d1d5db' }}>
                      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm transition-all duration-200" style={{ left: form.inStock ? '22px' : '2px' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: form.inStock ? '#009739' : '#6b7280' }}>
                      {form.inStock ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-12">
                    {form.inStock ? 'Visible to customers' : 'Hidden from store'}
                  </p>
                </div>
              </div>

              {/* Organization */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Organization</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category<span className="text-red-500 ml-0.5">*</span></label>
                  <select value={form.category}
                    onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setErrors(er => ({ ...er, category: '' })); }}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#009739] bg-white ${errors.category ? 'border-red-400' : 'border-gray-200'}`}>
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags</label>
                  <input type="text" value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="wireless, electronics…"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#009739] bg-white transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
                </div>
              </div>

              {/* Product badges */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Badges</h3>
                <p className="text-xs text-gray-400 mb-3">Shown on product cards and the product page</p>
                <Toggle k="isNew" label="New arrival" />
                <Toggle k="isDeal" label="Hot deal" />
                <div className="pt-2">
                  <p className="text-xs text-gray-400">For Best Seller or Trending, add the tag <span className="font-mono bg-gray-100 px-1 rounded">bestseller</span> or <span className="font-mono bg-gray-100 px-1 rounded">trending</span></p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Order Update Modal ───────────────────────────────────────────────────────
function OrderUpdateModal({ order, currentStatus, onUpdate, onClose }: {
  order: Order; currentStatus: string; onUpdate: (id: string, status: string) => void; onClose: () => void;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const STEPS = [
    { value: 'awaiting_payment', label: 'Awaiting Payment', sub: 'Buyer has not paid yet' },
    { value: 'payment_confirmed', label: 'Payment Confirmed', sub: 'Funds received in escrow — prepare order' },
    { value: 'funds_held', label: 'Pack & Ship', sub: 'Order is packed, ready for dispatch' },
    { value: 'in_transit', label: 'In Transit / Dispatched', sub: 'Shipped via DHL or InDrive' },
    { value: 'delivery_confirmed', label: 'Delivered', sub: 'Buyer confirmed receipt' },
    { value: 'released', label: 'Paid Out', sub: 'Funds released to your EcoCash' },
  ];

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    onUpdate(order.orderId, status);
    const stepLabel = STEPS.find(s => s.value === status)?.label ?? status;
    toast.success(`Order #${order.orderId} → ${stepLabel}`);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
          <div>
            <p className="text-gray-900" style={{ fontWeight: 700 }}>Update Order Status</p>
            <p className="text-xs text-gray-400 mt-0.5">#{order.orderId}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-none bg-transparent"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        {/* Product row */}
        <div className="mx-5 mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <img src={order.productImage} alt={order.productName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>{order.productName}</p>
            <p className="text-xs text-gray-400">Qty {order.quantity} · {order.deliveryMethod}</p>
          </div>
          <StatusBadge status={currentStatus} />
        </div>

        {/* Status selection */}
        <div className="px-5 py-4 space-y-2">
          {STEPS.map((step) => {
            const isSelected = status === step.value;
            const isCurrent = currentStatus === step.value;
            const isPast = STATUS_FLOW.indexOf(step.value) < STATUS_FLOW.indexOf(currentStatus);
            return (
              <button key={step.value} onClick={() => setStatus(step.value)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer border"
                style={{
                  borderColor: isSelected ? '#009739' : '#e5e7eb',
                  background: isSelected ? '#f0faf4' : isPast ? '#fafafa' : '#fff',
                }}>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{ borderColor: isSelected ? '#009739' : isPast ? '#009739' : '#d1d5db', background: isPast ? '#009739' : 'transparent' }}>
                  {isPast ? <Check className="w-3 h-3 text-white" />
                    : isSelected ? <div className="w-2 h-2 rounded-full bg-[#009739]" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ fontWeight: isSelected || isCurrent ? 700 : 500, color: isPast ? '#6b7280' : '#111' }}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-gray-400">{step.sub}</p>
                </div>
                {isCurrent && !isSelected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600" style={{ fontWeight: 700 }}>Current</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm cursor-pointer bg-white" style={{ fontWeight: 600 }}>Cancel</button>
          <button onClick={save} disabled={saving || status === currentStatus}
            className="flex-1 py-2.5 rounded-xl bg-[#009739] hover:bg-[#007f30] text-white text-sm cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            style={{ fontWeight: 700 }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Updating…' : 'Save status'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Withdrawal Modal ──────────────────────────────────────────────────────────
function WithdrawalModal({ balance, onClose, formatPrice }: { balance: number; onClose: () => void; formatPrice: (n: number) => string }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form');
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false); setStep('done');
    toast.success('Withdrawal sent!', { description: `${formatPrice(+amount)} sent to your EcoCash.` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
          <p className="text-gray-900" style={{ fontWeight: 700 }}>Withdraw to EcoCash</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer border-none bg-transparent"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="px-5 py-5">
          {step === 'done' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-[#009739]" />
              </div>
              <p className="text-gray-900 mb-1" style={{ fontWeight: 700 }}>Withdrawal sent!</p>
              <p className="text-sm text-gray-500 mb-4">Funds arrive in your EcoCash within 2 minutes.</p>
              <button onClick={onClose} className="px-5 py-2 bg-[#009739] text-white rounded-xl text-sm border-none cursor-pointer" style={{ fontWeight: 600 }}>Done</button>
            </div>
          ) : step === 'confirm' ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                {[['Amount', formatPrice(+amount), '#009739'], ['To', '+263 77x xxx xxx', '#111'], ['Via', 'EcoCash Mobile Money', '#111'], ['Arrives', 'Within 2 minutes', '#111']].map(([k, v, c]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-500">{k}</span>
                    <span style={{ fontWeight: 600, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('form')} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm cursor-pointer" style={{ fontWeight: 600 }}>Back</button>
                <button onClick={confirm} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#009739] text-white text-sm cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ fontWeight: 700 }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{loading ? 'Sending…' : 'Confirm'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Available balance</p>
                <p style={{ fontSize: '2rem', fontWeight: 900, color: '#009739' }}>{formatPrice(balance)}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Amount to withdraw (USD)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" max={balance}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009739] bg-gray-50" />
                <div className="flex gap-2 mt-2">
                  {[25, 50, 100].map(v => (
                    <button key={v} onClick={() => setAmount(String(Math.min(v, balance)))}
                      className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs border-none cursor-pointer transition-colors" style={{ fontWeight: 600 }}>
                      ${v}
                    </button>
                  ))}
                  <button onClick={() => setAmount(String(balance))} className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs border-none cursor-pointer transition-colors" style={{ fontWeight: 600 }}>All</button>
                </div>
              </div>
              <button onClick={() => { if (!amount || +amount <= 0 || +amount > balance) { toast.error('Enter a valid amount'); return; } setStep('confirm'); }}
                className="w-full py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl text-sm border-none cursor-pointer transition-colors" style={{ fontWeight: 700 }}>
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Custom recharts tooltip ──────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, prefix = '$' }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-lg">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-sm" style={{ fontWeight: 700, color: p.color }}>
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Main SellerDashboard ─────────────────────────────────────────────────────
export function SellerDashboard() {
  const navigate = useNavigate();
  const {
    user, formatPrice, currency, toggleCurrency, sellerDbId,
    sellerProducts, addSellerProduct, updateSellerProduct, toggleProductStock, removeSellerProduct,
    notifications, unreadCount, markAllRead, addNotification,
    onboardingStatus,
  } = useStore();

  const [tab, setTab] = useState<Tab>('overview');
  const [sellerOrders, setSellerOrders] = useState<SellerOrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Settings tab state
  const [settingsName, setSettingsName] = useState('');
  const [settingsEcocash, setSettingsEcocash] = useState('');
  const [settingsWhatsapp, setSettingsWhatsapp] = useState('');
  const [settingsLocation, setSettingsLocation] = useState('');
  const [settingsDescription, setSettingsDescription] = useState('');
  const [settingsCategory, setSettingsCategory] = useState('');
  const [settingsWebsite, setSettingsWebsite] = useState('');
  const [settingsLogo, setSettingsLogo] = useState('');
  const [settingsBanner, setSettingsBanner] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Load seller profile for settings
  useEffect(() => {
    if (!sellerDbId) return;
    fetchSellerById(sellerDbId).then(seller => {
      if (!seller) return;
      setSettingsName(seller.name ?? '');
      setSettingsWhatsapp(seller.whatsapp ?? '');
      setSettingsLocation(seller.location ?? '');
      setSettingsDescription(seller.description ?? '');
      setSettingsCategory(seller.category ?? '');
      setSettingsLogo(seller.logo ?? '');
      setSettingsBanner(seller.banner ?? '');
    });
  }, [sellerDbId]);

  const saveSettings = async () => {
    if (!sellerDbId) return;
    setSettingsSaving(true);
    await updateSeller(sellerDbId, {
      name: settingsName,
      whatsapp: settingsWhatsapp,
      location: settingsLocation,
      description: settingsDescription,
      logo: settingsLogo,
      banner: settingsBanner,
    });
    setSettingsSaving(false);
    toast.success('Profile saved!');
  };

  // Load seller orders from DB
  useEffect(() => {
    if (!sellerDbId || !isSupabaseConfigured) return;
    setOrdersLoading(true);
    fetchSellerOrders(sellerDbId)
      .then(orders => { setSellerOrders(orders); setOrdersLoading(false); })
      .catch(() => setOrdersLoading(false));
  }, [sellerDbId]);

  // Show a bottom toast once when seller lands on dashboard with pending status
  useEffect(() => {
    if (onboardingStatus === 'pending') {
      toast('⏳ Application under review', {
        description: 'Our team usually reviews within 1–2 business days. You\'ll be notified here when approved.',
        duration: 6000,
        position: 'bottom-center',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [fulfillmentOrder, setFulfillmentOrder] = useState<TrackOrderData | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Persistent order status overrides (Pending → Processing → Delivered flow)
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});
  const getStatus = (id: string, def: string) => orderStatuses[id] ?? def;
  const updateOrderStatus = (orderId: string, status: string) => {
    setOrderStatuses(prev => ({ ...prev, [orderId]: status }));
    const label = ESCROW_META[status]?.label ?? status;
    addNotification({ type: 'order', title: 'Order Updated', body: `Order #${orderId} moved to "${label}"` });
    ordersDb.updateOrderStatus(orderId, { escrow_status: status as SellerOrderItem['escrowStatus'] });
  };

  const openFulfillment = (order: Order) => {
    setFulfillmentOrder({
      id: order.orderId,
      productName: order.productName,
      productImage: order.productImage,
      sellerName: user?.name ?? '',
      total: order.price * order.quantity,
      escrowStatus: getStatus(order.orderId, order.escrowStatus) as EscrowStatus,
      deliveryMethod: order.deliveryMethod,
      trackingNumber: order.trackingNumber,
      deliveryPartner: order.deliveryPartner,
      date: order.date,
      address: order.address,
      buyerName: order.buyerName,
      buyerPhone: order.buyerPhone,
    });
  };

  // Product search & view
  const [productSearch, setProductSearch] = useState('');
  const [productView, setProductView] = useState<'list' | 'grid'>('list');
  const [orderFilter, setOrderFilter] = useState('all');

  const allOrders = sellerOrders;
  const totalSales = allOrders.reduce((s, o) => s + o.price * o.quantity, 0);
  const platformFee = totalSales * 0.02;
  const netEarnings = totalSales - platformFee;

  // ── Real chart data computed from orders ────────────────────────────────
  const REVENUE_DATA = useMemo(() => {
    const months: Record<string, { month: string; revenue: number; orders: number }> = {};
    allOrders.forEach(o => {
      const d = new Date(o.date);
      const key = isNaN(d.getTime())
        ? o.date.slice(0, 7)
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = isNaN(d.getTime())
        ? o.date.slice(0, 7)
        : d.toLocaleString('en', { month: 'short' });
      if (!months[key]) months[key] = { month: label, revenue: 0, orders: 0 };
      months[key].revenue += o.price * o.quantity;
      months[key].orders += 1;
    });
    const sorted = Object.entries(months).sort(([a], [b]) => a.localeCompare(b));
    return sorted.length > 0
      ? sorted.map(([, v]) => v)
      : [{ month: 'No data', revenue: 0, orders: 0 }];
  }, [allOrders]);

  const CATEGORY_DATA = useMemo(() => {
    const cats: Record<string, number> = {};
    sellerProducts.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + p.price;
    });
    const sorted = Object.entries(cats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));
    return sorted.length > 0 ? sorted : [{ name: 'No products', revenue: 0 }];
  }, [sellerProducts]);

  const filteredProducts = sellerProducts.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return allOrders;
    return allOrders.filter(o => getStatus(o.orderId, o.escrowStatus) === orderFilter);
  }, [orderFilter, allOrders, orderStatuses]);

  // Sidebar badge counts
  const needsActionCount = allOrders.filter(o => {
    const s = getStatus(o.orderId, o.escrowStatus);
    return s === 'payment_confirmed' || s === 'funds_held';
  }).length;
  const paymentsBadge = allOrders.filter(o => getStatus(o.orderId, o.escrowStatus) === 'delivery_confirmed').length;

  const inStockCount = sellerProducts.filter(p => p.inStock).length;
  const outOfStockCount = sellerProducts.filter(p => !p.inStock).length;

  // Quick action helpers
  const quickAction = (order: Order) => {
    const s = getStatus(order.orderId, order.escrowStatus);
    const next = STATUS_FLOW[STATUS_FLOW.indexOf(s) + 1];
    if (!next || s === 'released' || s === 'delivery_confirmed' || s === 'awaiting_payment') return null;
    const LABELS: Record<string, string> = {
      payment_confirmed: 'Accept Order',
      funds_held: 'Mark Dispatched',
    };
    return { label: LABELS[s], next };
  };

  const NAV: { id: Tab; icon: React.ElementType; label: string; badge?: number; badgeColor?: string }[] = [
    { id: 'overview',  icon: LayoutDashboard, label: 'Overview' },
    { id: 'products',  icon: Package,         label: 'Products', badge: outOfStockCount > 0 ? outOfStockCount : undefined, badgeColor: '#856404' },
    { id: 'orders',    icon: ShoppingBag,     label: 'Orders',   badge: needsActionCount > 0 ? needsActionCount : undefined, badgeColor: '#CE1126' },
    { id: 'payments',  icon: Wallet,          label: 'Payments', badge: paymentsBadge > 0 ? paymentsBadge : undefined, badgeColor: '#009739' },
    { id: 'analytics', icon: TrendingUp,      label: 'Analytics' },
    { id: 'profile',   icon: UserCircle,      label: 'Profile' },
  ];

  const TAB_LABELS: Record<Tab, string> = {
    overview: 'Overview', products: 'Products', orders: 'Orders',
    payments: 'Payments', analytics: 'Analytics', profile: 'Profile',
  };

  return (
    <div className="flex min-h-screen bg-white">

      {showWithdrawal && <WithdrawalModal balance={netEarnings} onClose={() => setShowWithdrawal(false)} formatPrice={formatPrice} />}
      {fulfillmentOrder && (
        <SellerFulfillmentModal
          order={fulfillmentOrder}
          onClose={() => setFulfillmentOrder(null)}
          onUpdateStatus={(status) => {
            updateOrderStatus(fulfillmentOrder.id, status);
            setFulfillmentOrder(prev => prev ? { ...prev, escrowStatus: status } : null);
          }}
        />
      )}
      {updatingOrder && (
        <OrderUpdateModal
          order={updatingOrder}
          currentStatus={getStatus(updatingOrder.id, updatingOrder.escrowStatus)}
          onUpdate={updateOrderStatus}
          onClose={() => setUpdatingOrder(null)}
        />
      )}

      {/* ── Notifications dropdown ── */}
      {showNotifs && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-6" onClick={() => setShowNotifs(false)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#EAEAEA] w-80 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3.5 border-b border-[#EAEAEA] flex items-center justify-between">
              <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>Notifications</p>
              <button onClick={() => { markAllRead(); }} className="text-xs text-[#009739] bg-transparent border-none cursor-pointer p-0" style={{ fontWeight: 600 }}>Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.map(n => (
                <div key={n.id} className="px-4 py-3 transition-colors" style={{ background: n.read ? '#fff' : 'rgba(0,151,57,0.03)' }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors" style={{ background: n.read ? '#e5e7eb' : '#009739' }} />
                    <div>
                      <p className="text-xs text-gray-900" style={{ fontWeight: 600 }}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ─────────────── Sidebar ─────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setShowMobileSidebar(false)} />
      )}
      <style>{`
        @media (min-width: 768px) { .seller-sidebar { transform: translateX(0) !important; } }
      `}</style>
      <aside
        className="seller-sidebar fixed left-0 flex flex-col z-30 border-r border-[#EAEAEA] transition-transform duration-300 bg-white"
        style={{
          top: SELLER_HEADER_H,
          height: `calc(100vh - ${SELLER_HEADER_H}px)`,
          width: 256,
          transform: showMobileSidebar ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setShowMobileSidebar(false)}
          className="md:hidden absolute top-4 right-3 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer"
          aria-label="Close sidebar"
        >
          <X style={{ width: 16, height: 16 }} />
        </button>

        {/* Seller profile */}
        <div className="px-5 py-5 border-b border-[#EAEAEA]">
          <p className="text-gray-900 truncate" style={{ fontSize: '0.9rem', fontWeight: 800 }}>{user?.name ?? 'My Store'}</p>
          <p style={{ fontSize: '0.7rem', color: '#009739', fontWeight: 600 }} className="mt-0.5">Seller</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ id, icon: Icon, label, badge, badgeColor }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => { setTab(id); setShowMobileSidebar(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left cursor-pointer border-none text-sm"
                style={{
                  background: active ? 'rgba(0,151,57,0.08)' : 'transparent',
                  color: active ? '#009739' : '#6b7280',
                  fontWeight: active ? 700 : 500,
                }}>
                <Icon style={{ width: 16, height: 16 }} className="shrink-0" />
                {label}
                {badge != null && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-white min-w-[20px] text-center"
                    style={{ background: badgeColor, fontSize: '0.6rem', fontWeight: 700 }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="mt-2 pt-2 border-t border-[#EAEAEA]">
            <button onClick={() => setTab('profile')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left cursor-pointer border-none text-sm"
              style={{
                background: tab === 'profile' ? 'rgba(0,151,57,0.08)' : 'transparent',
                color: tab === 'profile' ? '#009739' : '#6b7280',
                fontWeight: tab === 'profile' ? 700 : 500,
              }}>
              <UserCircle style={{ width: 16, height: 16 }} className="shrink-0" />
              Profile
            </button>
            <button onClick={() => navigate('/shop')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left cursor-pointer border-none text-sm"
              style={{ color: '#9ca3af', fontWeight: 500 }}>
              <ExternalLink style={{ width: 16, height: 16 }} className="shrink-0" />
              Visit storefront
            </button>
          </div>
        </nav>

        {/* Currency toggle */}
        <div className="px-4 py-4 border-t border-[#EAEAEA]">
          <button onClick={toggleCurrency}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer border-none transition-all"
            style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>Currency</span>
            <span className="flex items-center gap-1.5" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#009739' }}>
              {currency} <RefreshCw className="w-3 h-3" />
            </span>
          </button>
        </div>
      </aside>

      {/* ─────────────── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white md:ml-64 ml-0">

        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#EAEAEA] px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 border-none bg-transparent cursor-pointer"
              aria-label="Open navigation"
            >
              <BarChart2 style={{ width: 18, height: 18 }} />
            </button>
            <h1 className="text-gray-900" style={{ fontWeight: 800, fontSize: '1.05rem' }}>{TAB_LABELS[tab]}</h1>
            {tab === 'orders' && needsActionCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(206,17,38,0.08)', color: '#CE1126', fontWeight: 700 }}>
                {needsActionCount} need action
              </span>
            )}
            {tab === 'payments' && paymentsBadge > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(0,151,57,0.08)', color: '#009739', fontWeight: 700 }}>
                {paymentsBadge} to release
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Bell */}
            <div className="relative">
              <button onClick={() => { setShowNotifs(!showNotifs); markAllRead(); }}
                className="relative p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors border-none bg-transparent cursor-pointer">
                <Bell style={{ width: 18, height: 18 }} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#CE1126] text-white rounded-full min-w-[16px] h-4 flex items-center justify-center"
                    style={{ fontSize: '9px', fontWeight: 700, padding: '0 3px' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Contextual header action */}
            {(tab === 'overview' || tab === 'products') && (
              <button onClick={() => navigate('/seller/products/new')}
                className="flex items-center gap-2 px-4 py-2 bg-[#009739] hover:bg-[#007f30] text-white rounded-lg transition-colors border-none cursor-pointer"
                style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                <Plus style={{ width: 14, height: 14 }} /> Add Product
              </button>
            )}
            {tab === 'payments' && (
              <button onClick={() => setShowWithdrawal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#009739] hover:bg-[#007f30] text-white rounded-lg transition-colors border-none cursor-pointer"
                style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                <Zap style={{ width: 14, height: 14 }} /> Withdraw
              </button>
            )}
          </div>
        </header>

        {/* ─ Mobile tab strip (xs only) ─ */}
        <div className="md:hidden overflow-x-auto border-b border-gray-100 bg-white">
          <div className="flex gap-1 px-4 py-2 min-w-max">
            {NAV.map(({ id, icon: Icon, label, badge, badgeColor }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap cursor-pointer border-none transition-all relative"
                style={{
                  background: tab === id ? '#009739' : '#f3f4f6',
                  color: tab === id ? '#fff' : '#6b7280',
                  fontWeight: tab === id ? 700 : 500,
                }}
              >
                <Icon style={{ width: 13, height: 13 }} />
                {label}
                {badge != null && (
                  <span className="ml-0.5 px-1 py-0 rounded-full text-white" style={{ background: badgeColor, fontSize: '0.55rem', fontWeight: 700 }}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => setTab('profile')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap cursor-pointer border-none transition-all"
              style={{ background: tab === 'profile' ? '#009739' : '#f3f4f6', color: tab === 'profile' ? '#fff' : '#6b7280', fontWeight: tab === 'profile' ? 700 : 500 }}
            >
              <UserCircle style={{ width: 13, height: 13 }} />
              Profile
            </button>
          </div>
        </div>

        {/* ─ Tab content ─ */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8">

          {/* ══════════════════════════════════════════════════
              OVERVIEW
          ══════════════════════════════════════════════════ */}
          {tab === 'overview' && (
            <div className="flex flex-col gap-6">

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: formatPrice(totalSales), icon: DollarSign, color: '#009739', bg: 'rgba(0,151,57,0.08)', delta: '+12%' },
                  { label: 'Net Earnings', value: formatPrice(netEarnings), icon: Wallet, color: '#009739', bg: 'rgba(0,151,57,0.08)', delta: '+12%' },
                  { label: 'Active Orders', value: String(needsActionCount), icon: ShoppingBag, color: '#856404', bg: 'rgba(255,209,0,0.12)', delta: null },
                  { label: 'Products Listed', value: String(sellerProducts.length), icon: Package, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)', delta: null },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white border border-[#EAEAEA] rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                          <Icon className="w-4 h-4" style={{ color: stat.color }} />
                        </div>
                        {stat.delta && (
                          <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,151,57,0.08)', fontSize: '0.65rem', fontWeight: 700, color: '#009739' }}>
                            <ArrowUpRight className="w-3 h-3" />{stat.delta}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1.3rem' }}>{stat.value}</p>
                      <p className="text-gray-400 mt-0.5" style={{ fontSize: '0.75rem' }}>{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Revenue sparkline + quick actions */}
              <div className="grid grid-cols-3 gap-5">
                {/* Sparkline */}
                <div className="col-span-2 bg-white border border-[#EAEAEA] rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Revenue Trend</p>
                      <p className="text-gray-400 text-xs mt-0.5">Last 6 months</p>
                    </div>
                    <button onClick={() => setTab('analytics')} className="flex items-center gap-1 text-[#009739] bg-transparent border-none cursor-pointer p-0" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      Full report <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={REVENUE_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#009739" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#009739" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#009739" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#009739', r: 3, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Quick actions */}
                <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 flex flex-col gap-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Quick Actions</p>
                  {[
                    { label: 'Add Product', icon: Plus, color: '#009739', bg: 'rgba(0,151,57,0.08)', action: () => navigate('/seller/products/new') },
                    { label: 'Withdraw Funds', icon: Zap, color: '#856404', bg: 'rgba(255,209,0,0.12)', action: () => setShowWithdrawal(true) },
                    { label: 'View Orders', icon: ShoppingBag, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)', action: () => setTab('orders') },
                    { label: 'Analytics', icon: TrendingUp, color: '#CE1126', bg: 'rgba(206,17,38,0.08)', action: () => setTab('analytics') },
                  ].map(({ label, icon: Icon, color, bg, action }) => (
                    <button key={label} onClick={action}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left cursor-pointer border-none bg-transparent w-full">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <span className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>{label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent orders */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="px-6 py-4 border-b border-[#EAEAEA] flex items-center justify-between">
                  <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Recent Orders</p>
                  <button onClick={() => setTab('orders')} className="flex items-center gap-1 text-[#009739] bg-transparent border-none cursor-pointer p-0" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {allOrders.map(order => {
                    const status = getStatus(order.orderId, order.escrowStatus);
                    const qa = quickAction(order);
                    return (
                      <div key={order.id} className="px-6 py-4 flex items-center gap-4">
                        <img src={order.productImage || ''} alt={order.productName || ''} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 truncate" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.productName || `Order #${order.orderId}`}</p>
                          <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>#{order.orderId} · {order.date}</p>
                        </div>
                        <StatusBadge status={status} />
                        <span className="text-gray-900 shrink-0" style={{ fontWeight: 700, fontSize: '0.88rem' }}>{formatPrice(order.price * order.quantity)}</span>
                        {qa ? (
                          <button onClick={() => { updateOrderStatus(order.orderId, qa.next); toast.success(`Order #${order.orderId} → ${ESCROW_META[qa.next]?.label}`); }}
                            className="shrink-0 px-2.5 py-1 rounded-lg text-xs text-white border-none cursor-pointer bg-[#009739] hover:bg-[#007f30] transition-colors"
                            style={{ fontWeight: 700 }}>
                            {qa.label}
                          </button>
                        ) : (
                          <button onClick={() => openFulfillment(order)}
                            className="shrink-0 px-2.5 py-1 rounded-lg text-xs text-white border-none cursor-pointer transition-colors"
                            style={{ background: '#009739', fontWeight: 700 }}>
                            Track
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              PRODUCTS
          ══════════════════════════════════════════════════ */}
          {tab === 'products' && (
            <div className="flex flex-col gap-5">
              {/* Stats strip */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total', value: sellerProducts.length, color: '#111' },
                  { label: 'In Stock', value: inStockCount, color: '#009739' },
                  { label: 'Out of Stock', value: outOfStockCount, color: '#CE1126' },
                  { label: 'Active Deals', value: sellerProducts.filter(p => p.isDeal).length, color: '#856404' },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-[#EAEAEA] rounded-2xl px-5 py-4 flex items-center gap-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div className="flex-1">
                      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</p>
                      <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="px-5 py-4 border-b border-[#EAEAEA] flex items-center justify-between gap-4">
                  <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    All Products <span className="text-gray-400" style={{ fontWeight: 400 }}>({filteredProducts.length})</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <input placeholder="Search products…" value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
                        style={{ fontSize: '0.8rem', width: 150 }}
                      />
                    </div>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      {(['list', 'grid'] as const).map(v => (
                        <button key={v} onClick={() => setProductView(v)}
                          className="p-2 transition-colors cursor-pointer border-none"
                          style={{ background: productView === v ? '#f3f4f6' : '#fff', color: productView === v ? '#111' : '#9ca3af' }}>
                          {v === 'list' ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => navigate('/seller/products/new')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#009739] hover:bg-[#007f30] text-white rounded-lg text-xs border-none cursor-pointer transition-colors"
                      style={{ fontWeight: 700 }}>
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-3">No products found.</p>
                    <button onClick={() => { setProductSearch(''); navigate('/seller/products/new'); }}
                      className="px-4 py-2 bg-[#009739] text-white rounded-xl text-sm border-none cursor-pointer" style={{ fontWeight: 600 }}>
                      Add Product
                    </button>
                  </div>
                ) : productView === 'grid' ? (
                  <div className="p-5 grid grid-cols-3 gap-4">
                    {filteredProducts.map(p => (
                      <div key={p.id} className="border border-[#EAEAEA] rounded-2xl overflow-hidden hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div className="relative" style={{ height: 140 }}>
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 flex gap-1">
                            {!p.inStock && <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px]" style={{ fontWeight: 700 }}>Out</span>}
                            {p.isDeal && <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]" style={{ fontWeight: 700 }}>Deal</span>}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-gray-900 truncate" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{p.name}</p>
                          <p className="text-gray-400" style={{ fontSize: '0.7rem' }}>{p.category}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span style={{ color: '#009739', fontWeight: 800, fontSize: '0.9rem' }}>{formatPrice(p.price)}</span>
                            <div className="flex gap-1">
                              <button onClick={() => navigate(`/seller/products/${p.id}/edit`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer border-none bg-transparent"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => { removeSellerProduct(p.id); toast.success('Product removed'); }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer border-none bg-transparent"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filteredProducts.map(p => (
                      <div key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                        <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 truncate" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</p>
                            {p.isDeal && <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px]" style={{ fontWeight: 700 }}>Deal</span>}
                            {p.isNew && <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px]" style={{ fontWeight: 700 }}>New</span>}
                          </div>
                          <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>{p.category}</p>
                        </div>
                        <button onClick={() => { toggleProductStock(p.id); toast.success(`${p.name} marked ${p.inStock ? 'out of stock' : 'in stock'}`); }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer border-none transition-colors"
                          style={{ background: p.inStock ? 'rgba(0,151,57,0.08)' : '#f3f4f6', color: p.inStock ? '#009739' : '#6b7280', fontSize: '0.72rem', fontWeight: 600 }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-[#009739]' : 'bg-gray-400'}`} />
                          {p.inStock ? 'In stock' : 'Out of stock'}
                        </button>
                        <span style={{ fontWeight: 800, color: '#009739', fontSize: '0.9rem', minWidth: 72, textAlign: 'right' }}>{formatPrice(p.price)}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => navigate(`/seller/products/${p.id}/edit`)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer border-none bg-transparent"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { removeSellerProduct(p.id); toast.success('Product removed'); }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ORDERS
          ══════════════════════════════════════════════════ */}
          {tab === 'orders' && (
            <div className="flex flex-col gap-5">
              {ordersLoading && (
                <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span style={{ fontSize: '0.85rem' }}>Loading orders…</span>
                </div>
              )}
              {/* Filter tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All Orders', count: allOrders.length },
                  { value: 'payment_confirmed', label: 'Accept', count: allOrders.filter(o => getStatus(o.orderId, o.escrowStatus) === 'payment_confirmed').length },
                  { value: 'funds_held', label: 'Pack & Ship', count: allOrders.filter(o => getStatus(o.orderId, o.escrowStatus) === 'funds_held').length },
                  { value: 'in_transit', label: 'In Transit', count: allOrders.filter(o => getStatus(o.orderId, o.escrowStatus) === 'in_transit').length },
                  { value: 'delivery_confirmed', label: 'Delivered', count: allOrders.filter(o => getStatus(o.orderId, o.escrowStatus) === 'delivery_confirmed').length },
                  { value: 'released', label: 'Paid Out', count: allOrders.filter(o => getStatus(o.orderId, o.escrowStatus) === 'released').length },
                ].map(f => (
                  <button key={f.value} onClick={() => setOrderFilter(f.value)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer"
                    style={{
                      background: orderFilter === f.value ? '#009739' : '#fff',
                      borderColor: orderFilter === f.value ? '#009739' : '#e5e7eb',
                      color: orderFilter === f.value ? '#fff' : '#374151',
                      fontSize: '0.78rem', fontWeight: 600,
                    }}>
                    {f.label}
                    {f.count > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full"
                        style={{ background: orderFilter === f.value ? 'rgba(255,255,255,0.25)' : '#f3f4f6', color: orderFilter === f.value ? '#fff' : '#6b7280', fontSize: '0.65rem', fontWeight: 700 }}>
                        {f.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Order list */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {filteredOrders.length === 0 ? (
                  <div className="py-16 text-center">
                    <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No orders in this stage.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filteredOrders.map(order => {
                      const status = getStatus(order.orderId, order.escrowStatus);
                      const qa = quickAction(order);
                      return (
                        <div key={order.id} className="px-6 py-5">
                          <div className="flex items-start gap-4">
                            <img src={order.productImage} alt={order.productName} className="w-14 h-14 rounded-xl object-cover shrink-0" />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                  <p className="text-gray-900" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{order.productName}</p>
                                  <p className="text-gray-400 mt-0.5" style={{ fontSize: '0.72rem' }}>
                                    #{order.orderId} &nbsp;·&nbsp; Qty {order.quantity} &nbsp;·&nbsp; {order.deliveryMethod} &nbsp;·&nbsp; {order.date}
                                  </p>
                                  {order.trackingNumber && (
                                    <p className="mt-1 flex items-center gap-1" style={{ fontSize: '0.72rem', color: '#009739', fontWeight: 600 }}>
                                      <Truck className="w-3 h-3" /> {order.trackingNumber}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <StatusBadge status={status} />
                                  <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatPrice(order.price * order.quantity)}</span>
                                </div>
                              </div>

                              {/* Status progress bar */}
                              <div className="mt-3 flex items-center gap-1">
                                {STATUS_FLOW.map((s, idx) => {
                                  const currentIdx = STATUS_FLOW.indexOf(status);
                                  const filled = idx <= currentIdx;
                                  return (
                                    <React.Fragment key={s}>
                                      <div className="w-2 h-2 rounded-full shrink-0 transition-all" style={{ background: filled ? '#009739' : '#e5e7eb' }} />
                                      {idx < STATUS_FLOW.length - 1 && (
                                        <div className="h-0.5 flex-1 transition-all" style={{ background: idx < currentIdx ? '#009739' : '#e5e7eb' }} />
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[11px] text-gray-400">Awaiting Payment</span>
                                <span className="text-[11px] text-gray-400">Paid Out</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-4 pl-[72px]">
                            {qa && (
                              <button onClick={() => { updateOrderStatus(order.orderId, qa.next); }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs border-none cursor-pointer transition-colors"
                                style={{ background: '#009739', fontWeight: 700 }}>
                                <ArrowRight className="w-3 h-3" /> {qa.label}
                              </button>
                            )}
                            <button onClick={() => openFulfillment(order)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs border-none cursor-pointer transition-colors"
                              style={{ background: 'rgba(0,151,57,0.08)', color: '#009739', fontWeight: 700 }}>
                              <Eye className="w-3 h-3" /> Fulfillment
                            </button>
                            <button onClick={() => setUpdatingOrder(order)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs border-none cursor-pointer transition-colors"
                              style={{ fontWeight: 600 }}>
                              <MoreVertical className="w-3 h-3" /> Update Status
                            </button>
                            {status === 'released' && (
                              <span className="flex items-center gap-1 text-xs text-[#009739]" style={{ fontWeight: 600 }}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Funds paid to your EcoCash
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              PAYMENTS
          ══════════════════════════════════════════════════ */}
          {tab === 'payments' && (
            <div className="flex flex-col gap-5">
              {/* Wallet card */}
              <div className="rounded-2xl p-7 text-white overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #009739 0%, #006e2a 100%)' }}>
                <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#FFD100', transform: 'translate(30%, -40%)' }} />
                <div className="relative z-10">
                  <p className="text-white/60 mb-2" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Available Balance</p>
                  <p className="text-white mb-1" style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1 }}>{formatPrice(netEarnings)}</p>
                  <p className="text-white/50" style={{ fontSize: '0.8rem' }}>EcoCash · +263 77x xxx xxx</p>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setShowWithdrawal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer border-none"
                      style={{ background: 'white', color: '#009739', fontSize: '0.82rem', fontWeight: 700 }}>
                      <Zap className="w-4 h-4" /> Withdraw to EcoCash
                    </button>
                  </div>
                </div>
              </div>

              {/* Earnings breakdown */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Gross Revenue', value: formatPrice(totalSales), sub: 'Before platform fee', color: '#111' },
                  { label: 'Platform Fee (2%)', value: `-${formatPrice(platformFee)}`, sub: 'Deducted by Msika', color: '#CE1126' },
                  { label: 'Net Earnings', value: formatPrice(netEarnings), sub: 'Available to withdraw', color: '#009739' },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-[#EAEAEA] rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <p style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color }}>{s.value}</p>
                    <p className="text-gray-900 mt-0.5" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.label}</p>
                    <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Payment status table */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="px-6 py-4 border-b border-[#EAEAEA] flex items-center justify-between">
                  <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Payment Status by Order</p>
                  <p className="text-xs text-gray-400">All transactions via EcoCash Escrow</p>
                </div>
                {/* Table header */}
                <div className="px-6 py-2.5 bg-gray-50 border-b border-[#EAEAEA] grid grid-cols-6 gap-4">
                  {['Order', 'Product', 'Date', 'Amount', 'Fee', 'Status'].map(h => (
                    <p key={h} className="text-gray-400" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-gray-50">
                  {allOrders.map(order => {
                    const status = getStatus(order.orderId, order.escrowStatus);
                    const gross = order.price * order.quantity;
                    const fee = gross * 0.02;
                    return (
                      <div key={order.id} className="px-6 py-4 grid grid-cols-6 gap-4 items-center hover:bg-gray-50/50 transition-colors">
                        <p className="text-gray-600 font-mono" style={{ fontSize: '0.75rem', fontWeight: 600 }}>#{order.orderId}</p>
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={order.productImage} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                          <p className="text-gray-800 truncate" style={{ fontSize: '0.78rem', fontWeight: 600 }}>{order.productName}</p>
                        </div>
                        <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>{order.date}</p>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{formatPrice(gross)}</p>
                        <p style={{ fontWeight: 600, fontSize: '0.78rem', color: '#CE1126' }}>-{formatPrice(fee)}</p>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={status} />
                          {status === 'delivery_confirmed' && (
                            <button onClick={() => updateOrderStatus(order.orderId, 'released')}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#009739] text-white border-none cursor-pointer"
                              style={{ fontWeight: 700 }}>
                              Release
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Escrow explanation */}
              <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: 'rgba(0,151,57,0.05)', border: '1px solid rgba(0,151,57,0.15)' }}>
                <ShieldCheck className="w-5 h-5 text-[#009739] shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900" style={{ fontSize: '0.82rem', fontWeight: 700 }}>EcoCash Escrow Protection</p>
                  <p className="text-gray-500 mt-1" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
                    Buyer funds are held securely in escrow until the buyer confirms delivery. Once confirmed, funds are released to your EcoCash wallet within 24 hours. Msika deducts a 2% platform fee before releasing payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              ANALYTICS
          ══════════════════════════════════════════════════ */}
          {tab === 'analytics' && (
            <div className="flex flex-col gap-5">
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: formatPrice(totalSales), icon: DollarSign, color: '#009739', bg: 'rgba(0,151,57,0.08)', sub: 'All time' },
                  { label: 'Orders Completed', value: String(allOrders.filter(o => getStatus(o.orderId, o.escrowStatus) === 'released').length), icon: CheckCircle2, color: '#009739', bg: 'rgba(0,151,57,0.08)', sub: 'Released' },
                  { label: 'Avg. Order Value', value: formatPrice(totalSales / Math.max(allOrders.length, 1)), icon: BarChart2, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)', sub: 'Per order' },
                  { label: 'Products Listed', value: String(sellerProducts.length), icon: Package, color: '#856404', bg: 'rgba(255,209,0,0.12)', sub: `${inStockCount} in stock` },
                ].map(({ label, value, icon: Icon, color, bg, sub }) => (
                  <div key={label} className="bg-white border border-[#EAEAEA] rounded-2xl p-5" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: bg }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-gray-900" style={{ fontWeight: 900, fontSize: '1.3rem' }}>{value}</p>
                    <p className="text-gray-500" style={{ fontSize: '0.78rem', fontWeight: 600 }}>{label}</p>
                    <p className="text-gray-400" style={{ fontSize: '0.7rem' }}>{sub}</p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-5 gap-5">
                {/* Revenue area chart */}
                <div className="col-span-3 bg-white border border-[#EAEAEA] rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Monthly Revenue</p>
                      <p className="text-gray-400 text-xs mt-0.5">Oct 2025 – Mar 2026</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,151,57,0.08)' }}>
                      <ArrowUpRight className="w-3 h-3 text-[#009739]" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#009739' }}>+71% vs Oct</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#009739" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#009739" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#009739" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: '#009739', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#009739' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Category bar chart */}
                <div className="col-span-2 bg-white border border-[#EAEAEA] rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <p className="text-gray-900 mb-1" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Revenue by Category</p>
                  <p className="text-gray-400 text-xs mb-5">Top performing segments</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={75} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={20}>
                        {CATEGORY_DATA.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? '#009739' : i === 1 ? '#FFD100' : '#e5e7eb'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order fulfillment funnel */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-gray-900 mb-5" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order Fulfillment Pipeline</p>
                <div className="grid grid-cols-6 gap-3">
                  {STATUS_FLOW.map((s) => {
                    const count = allOrders.filter(o => getStatus(o.orderId, o.escrowStatus) === s).length;
                    const m = ESCROW_META[s];
                    const pct = (count / allOrders.length) * 100 || 0;
                    return (
                      <div key={s} className="text-center">
                        <div className="relative h-20 bg-gray-100 rounded-xl overflow-hidden mb-2 flex items-end">
                          <div className="w-full rounded-xl transition-all duration-500"
                            style={{ height: `${Math.max(pct, 8)}%`, background: count > 0 ? '#009739' : '#e5e7eb' }} />
                          <span className="absolute inset-0 flex items-center justify-center text-lg" style={{ fontWeight: 900, color: count > 0 ? '#009739' : '#d1d5db' }}>{count}</span>
                        </div>
                        <p className="text-gray-600 leading-tight" style={{ fontSize: '0.7rem', fontWeight: 600 }}>{m.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top products */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="px-6 py-4 border-b border-[#EAEAEA]">
                  <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '0.9rem' }}>Top Products by Revenue</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {sellerProducts.slice(0, 5).map((p, idx) => {
                    const rev = p.price * (5 - idx);
                    const maxRev = sellerProducts.slice(0, 5)[0]?.price * 5 || 1;
                    return (
                      <div key={p.id} className="px-6 py-3.5 flex items-center gap-4">
                        <span className="text-gray-300 shrink-0" style={{ fontWeight: 700, fontSize: '0.75rem', width: 16 }}>#{idx + 1}</span>
                        <img src={p.image} alt={p.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 truncate" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.name}</p>
                          <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden" style={{ width: '100%' }}>
                            <div className="h-full rounded-full bg-[#009739] transition-all" style={{ width: `${(rev / maxRev) * 100}%` }} />
                          </div>
                        </div>
                        <span style={{ fontWeight: 800, color: '#009739', fontSize: '0.85rem', minWidth: 60, textAlign: 'right' }}>{formatPrice(rev)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              PROFILE
          ══════════════════════════════════════════════════ */}
          {tab === 'profile' && (
            <div className="max-w-3xl flex flex-col gap-6">

              {/* ── Cover + Avatar card ── */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {/* Cover image */}
                <div className="relative h-44 bg-gradient-to-br from-[#009739]/20 to-[#009739]/5 overflow-hidden group">
                  {settingsBanner ? (
                    <img src={settingsBanner} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-12 h-12 text-[#009739]/20" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 group-hover:bg-black/30 transition-all cursor-pointer">
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file || !sellerDbId) return;
                      const toastId = toast.loading('Uploading cover photo…');
                      const { url, error } = await uploadSellerImage(user!.id, 'banner', file);
                      toast.dismiss(toastId);
                      if (error || !url) { toast.error(error ?? 'Failed to upload cover photo'); return; }
                      setSettingsBanner(url);
                      toast.success('Cover photo ready — click Save Profile to apply');
                    }} />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-lg text-gray-800 text-xs" style={{ fontWeight: 600 }}>
                      <Camera className="w-3.5 h-3.5" /> Change cover
                    </span>
                  </label>
                </div>

                {/* Avatar row */}
                <div className="px-6 pb-6">
                  <div className="flex items-end justify-between -mt-10 mb-4">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-[#009739] flex items-center justify-center shrink-0">
                        {settingsLogo ? (
                          <img src={settingsLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-2xl" style={{ fontWeight: 800 }}>
                            {settingsName.charAt(0) || user?.name.charAt(0) || 'S'}
                          </span>
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-2xl transition-all cursor-pointer">
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file || !sellerDbId) return;
                          const toastId = toast.loading('Uploading logo…');
                          const { url, error } = await uploadSellerImage(user!.id, 'logo', file);
                          toast.dismiss(toastId);
                          if (error || !url) { toast.error(error ?? 'Failed to upload logo'); return; }
                          setSettingsLogo(url);
                          toast.success('Logo ready — click Save Profile to apply');
                        }} />
                        <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </label>
                    </div>

                    <a
                      href={`/store/${sellerDbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 border border-[#009739] text-[#009739] rounded-xl text-xs no-underline hover:bg-[#009739] hover:text-white transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View store
                    </a>
                  </div>

                  {/* Quick stats strip */}
                  <div className="flex items-center gap-6 mb-1">
                    <div>
                      <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1.1rem' }}>{settingsName || user?.name}</p>
                      <p className="text-gray-400 flex items-center gap-1" style={{ fontSize: '0.78rem' }}>
                        <BadgeCheck className="w-3.5 h-3.5 text-[#009739]" /> Verified seller
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-4 text-center">
                      <div>
                        <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>{sellerProducts.length}</p>
                        <p className="text-gray-400" style={{ fontSize: '0.7rem' }}>Products</p>
                      </div>
                      <div>
                        <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>{allOrders.length}</p>
                        <p className="text-gray-400" style={{ fontSize: '0.7rem' }}>Orders</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1rem' }}>4.8</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Store info ── */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-gray-900 mb-5" style={{ fontWeight: 700, fontSize: '0.95rem' }}>Store Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Store Name</label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)}
                        placeholder="e.g. TechHaven ZW"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#009739] transition-colors bg-gray-50"
                        style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Category</label>
                    <div className="relative">
                      <select value={settingsCategory} onChange={e => setSettingsCategory(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#009739] transition-colors bg-gray-50 appearance-none"
                        style={{ fontSize: '0.85rem' }}>
                        <option value="">Select category…</option>
                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={settingsLocation} onChange={e => setSettingsLocation(e.target.value)}
                        placeholder="e.g. Harare CBD, Zimbabwe"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#009739] transition-colors bg-gray-50"
                        style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Website (optional)</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="url" value={settingsWebsite} onChange={e => setSettingsWebsite(e.target.value)}
                        placeholder="https://yourstore.co.zw"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#009739] transition-colors bg-gray-50"
                        style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Store Description</label>
                    <textarea value={settingsDescription} onChange={e => setSettingsDescription(e.target.value)}
                      rows={3}
                      placeholder="Tell buyers what makes your store unique…"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#009739] transition-colors bg-gray-50 resize-none"
                      style={{ fontSize: '0.85rem' }} />
                  </div>
                </div>
              </div>

              {/* ── Contact & payments ── */}
              <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-gray-900 mb-5" style={{ fontWeight: 700, fontSize: '0.95rem' }}>Contact & Payments</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 600 }}>EcoCash Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="tel" value={settingsEcocash} onChange={e => setSettingsEcocash(e.target.value)}
                        placeholder="+263 77 123 4567"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#009739] transition-colors bg-gray-50"
                        style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 600 }}>WhatsApp Number</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="tel" value={settingsWhatsapp} onChange={e => setSettingsWhatsapp(e.target.value)}
                        placeholder="+263 77 123 4567"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#009739] transition-colors bg-gray-50"
                        style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Save button ── */}
              <div className="flex items-center justify-between bg-white border border-[#EAEAEA] rounded-2xl px-6 py-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p className="text-gray-400" style={{ fontSize: '0.78rem' }}>Changes are visible to buyers on your store page.</p>
                <button onClick={saveSettings} disabled={settingsSaving}
                  className="px-6 py-2.5 bg-[#009739] hover:bg-[#007f30] text-white rounded-xl transition-colors border-none cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {settingsSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Profile'}
                </button>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
