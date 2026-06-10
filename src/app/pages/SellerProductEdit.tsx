import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Package, Loader2, X, Upload, ImageIcon, AlertCircle, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../context/StoreContext';
import { categories } from '../data/mockData';
import { uploadProductImageWithProgress } from '../../lib/storage';
import { isSupabaseConfigured } from '../../lib/supabase';
import { createProduct, updateProduct, fetchProductById } from '../../lib/db/products';
import type { Product } from '../data/mockData';

const DELIVERY_OPTIONS = ['Same-Day Delivery', 'Free Delivery', 'Home Delivery', 'Standard Delivery'];

type FormState = {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  tags: string;
  inStock: boolean;
  deliveryBadge: string;
  paymentMethods: string[];
  images: string[];
};

export function SellerProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, sellerDbId, addSellerProduct, updateSellerProduct } = useStore();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);

  // Per-file upload progress: localId → { preview, progress }
  const [uploading, setUploading] = useState<Record<string, { preview: string; progress: number }>>({});

  const [form, setForm] = useState<FormState>({
    name: '', description: '', price: '', originalPrice: '',
    category: '', tags: '', inStock: true,
    deliveryBadge: 'Same-Day Delivery',
    paymentMethods: ['EcoCash'],
    images: [],
  });

  // Load existing product when editing
  useEffect(() => {
    if (!isEdit) return;
    fetchProductById(id!).then(product => {
      if (product) {
        setForm({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          originalPrice: product.originalPrice?.toString() || '',
          category: product.category,
          tags: product.tags.join(', '),
          inStock: product.inStock,
          deliveryBadge: product.deliveryBadge,
          paymentMethods: product.paymentMethods,
          images: product.images.length > 0 ? product.images : product.image ? [product.image] : [],
        });
      }
      setLoading(false);
    });
  }, [id, isEdit]);

  // ── Media handlers ────────────────────────────────────────────────────────────
  const uploadFiles = (files: File[]) => {
    if (!files.length) return;
    const currentTotal = form.images.length + Object.keys(uploading).length;
    const remaining = 8 - currentTotal;
    if (remaining <= 0) { toast.error('Maximum 8 images reached'); return; }
    const toUpload = files.filter(f => f.type.startsWith('image/')).slice(0, remaining);

    toUpload.forEach(file => {
      const localId = `${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);

      // Register in uploading map immediately so the tile appears
      setUploading(prev => ({ ...prev, [localId]: { preview, progress: 0 } }));

      uploadProductImageWithProgress(
        user?.id ?? '',
        file,
        pct => setUploading(prev => prev[localId] ? { ...prev, [localId]: { ...prev[localId], progress: pct } } : prev),
      ).then(({ url, error }) => {
        // Remove from uploading map
        setUploading(prev => { const next = { ...prev }; delete next[localId]; return next; });
        URL.revokeObjectURL(preview);
        if (error || !url) { toast.error(`Failed to upload ${file.name}`); return; }
        setForm(f => ({ ...f, images: [...f.images, url] }));
      });
    });
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await uploadFiles(Array.from(e.target.files || []));
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    await uploadFiles(files);
  };

  const removeImage = (idx: number) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const moveImage = (from: number, to: number) => {
    setForm(f => {
      const imgs = [...f.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...f, images: imgs };
    });
  };

  // ── Validation & Save ─────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.price || isNaN(+form.price) || +form.price <= 0) e.price = 'Valid price required';
    if (!form.category) e.category = 'Select a category';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!sellerDbId) { toast.error('Seller account not found — please reload'); return; }

    setSaving(true);
    const img = form.images[0] || '';
    const payload: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'rating' | 'reviews' | 'reviewCount'> = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: +form.price,
      originalPrice: form.originalPrice ? +form.originalPrice : undefined,
      category: form.category,
      image: img,
      images: form.images,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      inStock: form.inStock,
      isDeal: false,
      isNew: true,
      deliveryBadge: form.deliveryBadge,
      paymentMethods: form.paymentMethods,
    };

    if (isEdit) {
      const updated = await updateProduct(id!, payload);
      if (updated) {
        updateSellerProduct(id!, { ...updated });
        toast.success('Product saved');
      } else {
        toast.error('Failed to save — please try again');
      }
    } else {
      const created = await createProduct(sellerDbId, payload);
      if (created) {
        addSellerProduct(created);
        toast.success('Product added to your store');
        navigate(`/seller/products/${created.id}/edit`);
      } else {
        toast.error('Failed to create product — please try again');
      }
    }
    setSaving(false);
  };

  // ── Reusable sub-components ───────────────────────────────────────────────────
  const Field = ({ k, label, placeholder, type = 'text', required = false }: {
    k: keyof FormState; label: string; placeholder: string; type?: string; required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[k] as string}
        onChange={e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })); }}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009739]/20 focus:border-[#009739] bg-white transition-colors ${errors[k] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
      />
      {errors[k] && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[k]}</p>}
    </div>
  );

  const Toggle = ({ k, label, description }: { k: keyof FormState; label: string; description?: string }) => (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => setForm(f => ({ ...f, [k]: !(f[k] as boolean) }))}
        className="shrink-0 w-10 h-5 rounded-full transition-colors relative border-none"
        style={{ background: (form[k] as boolean) ? '#009739' : '#d1d5db' }}
      >
        <span
          className="w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm transition-all duration-200"
          style={{ left: (form[k] as boolean) ? '22px' : '2px' }}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#009739]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/seller-dashboard')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors border-none bg-transparent text-gray-500"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <button onClick={() => navigate('/seller-dashboard')} className="text-gray-400 hover:text-gray-600 border-none bg-transparent p-0 cursor-pointer">
                Products
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="font-semibold text-gray-900">{isEdit ? (form.name || 'Edit product') : 'Add product'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/seller-dashboard')}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#009739] hover:bg-[#007f30] text-white text-sm font-bold cursor-pointer border-none disabled:opacity-60 flex items-center gap-2 transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* ── Left column ── */}
          <div className="space-y-5">

            {/* Title & Description */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <Field k="name" label="Title" placeholder="e.g. Wireless Earbuds Pro" required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description<span className="text-red-500 ml-0.5">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setErrors(er => ({ ...er, description: '' })); }}
                  placeholder="Describe your product — materials, sizing, use cases…"
                  rows={5}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009739]/20 focus:border-[#009739] bg-white resize-none transition-colors ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
              </div>
            </section>

            {/* Media */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Media</h2>
                {(form.images.length + Object.keys(uploading).length) > 0 && (
                  <span className="text-xs text-gray-400">
                    {form.images.length + Object.keys(uploading).length}/8 · first image is featured
                  </span>
                )}
              </div>

              {(() => {
                const uploadingEntries = Object.entries(uploading);
                const totalSlots = form.images.length + uploadingEntries.length;
                const isEmpty = totalSlots === 0;
                return (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className="rounded-xl border-2 border-dashed transition-colors overflow-hidden"
                    style={{ borderColor: dragOver ? '#009739' : '#D1D5DB', background: dragOver ? 'rgba(0,151,57,0.03)' : '#FAFAFA' }}
                  >
                    {isEmpty ? (
                      <label className="flex flex-col items-center justify-center gap-3 py-14 cursor-pointer">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-7 h-7 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-700">Add media</p>
                          <p className="text-xs text-gray-400 mt-0.5">or drop files to upload</p>
                        </div>
                        <span className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:border-[#009739] hover:text-[#009739] transition-colors">
                          Add files
                        </span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
                      </label>
                    ) : (
                      <div className="p-4">
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
                          {/* Uploaded images */}
                          {form.images.map((url, idx) => (
                            <div
                              key={url}
                              className="relative rounded-xl overflow-hidden bg-gray-100 group border border-gray-200"
                              style={{ aspectRatio: '1' }}
                            >
                              <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                              {idx === 0 && (
                                <span className="absolute top-1 left-1 bg-gray-900/75 text-white rounded px-1.5 py-0.5 text-[9px] font-bold leading-none">
                                  Featured
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                                {idx > 0 && (
                                  <button type="button" onClick={() => moveImage(idx, idx - 1)}
                                    className="w-7 h-7 rounded-full bg-white/90 text-gray-700 flex items-center justify-center border-none text-sm font-bold hover:bg-white shadow">‹</button>
                                )}
                                <button type="button" onClick={() => removeImage(idx)}
                                  className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center border-none hover:bg-red-600 shadow">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                {idx < form.images.length - 1 && (
                                  <button type="button" onClick={() => moveImage(idx, idx + 1)}
                                    className="w-7 h-7 rounded-full bg-white/90 text-gray-700 flex items-center justify-center border-none text-sm font-bold hover:bg-white shadow">›</button>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* In-progress upload tiles */}
                          {uploadingEntries.map(([localId, { preview, progress }]) => (
                            <div
                              key={localId}
                              className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                              style={{ aspectRatio: '1' }}
                            >
                              {/* Dim preview */}
                              <img src={preview} alt="" className="w-full h-full object-cover opacity-40" />
                              {/* Dark overlay */}
                              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1.5 px-2">
                                <span className="text-white text-[10px] font-semibold">{progress}%</span>
                                {/* Progress bar */}
                                <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-white rounded-full transition-all duration-200"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {totalSlots < 8 ? (
                          <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-dashed border-gray-300 text-sm font-semibold text-gray-500 hover:border-[#009739] hover:text-[#009739] cursor-pointer transition-colors bg-white">
                            <Upload className="w-4 h-4" />Add more images
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
                          </label>
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-1">Maximum 8 images reached</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
              <p className="text-xs text-gray-400 mt-2">Accepts JPG, PNG, WebP · Max 5 MB each · Drag thumbnails to reorder</p>
            </section>

            {/* Pricing */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (USD)<span className="text-red-500 ml-0.5">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.price}
                      onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setErrors(er => ({ ...er, price: '' })); }}
                      placeholder="0.00"
                      className={`w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009739]/20 focus:border-[#009739] bg-white transition-colors ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Compare-at price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.originalPrice}
                      onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009739]/20 focus:border-[#009739] bg-white transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Shows strikethrough · auto-badges "Hot Deal" if ≥15% off</p>
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Shipping</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery option</label>
                <select
                  value={form.deliveryBadge}
                  onChange={e => setForm(f => ({ ...f, deliveryBadge: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009739]/20 focus:border-[#009739] bg-white"
                >
                  {DELIVERY_OPTIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </section>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-5">

            {/* Status */}
            <section className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status</h2>
              <Toggle
                k="inStock"
                label={form.inStock ? 'Active' : 'Draft'}
                description={form.inStock ? 'Visible to customers' : 'Hidden from store'}
              />
            </section>

            {/* Organization */}
            <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Organization</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category<span className="text-red-500 ml-0.5">*</span></label>
                <select
                  value={form.category}
                  onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setErrors(er => ({ ...er, category: '' })); }}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009739]/20 focus:border-[#009739] bg-white ${errors.category ? 'border-red-400' : 'border-gray-300'}`}
                >
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="wireless, electronics…"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#009739]/20 focus:border-[#009739] bg-white transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
              </div>
            </section>

            {/* Platform badges info */}
            <section className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Badges</h2>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                Badges are assigned automatically by the platform — you don't need to set them.
              </p>
              <div className="space-y-2.5">
                {[
                  { label: 'New', color: '#009739', desc: 'Auto-assigned for 30 days after listing' },
                  { label: 'Best Seller', color: '#CE1126', desc: 'When your product reaches 50+ reviews' },
                  { label: 'Hot Deal', color: '#f97316', desc: 'When compare-at price is ≥15% higher' },
                  { label: 'Top Rated', color: '#009739', desc: '4.7★ rating with 20+ reviews' },
                  { label: 'Trending', color: '#009739', desc: 'Add tag "trending" to enable' },
                ].map(b => (
                  <div key={b.label} className="flex items-start gap-2">
                    <span
                      className="shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                      style={{ background: b.color }}
                    >
                      {b.label}
                    </span>
                    <p className="text-xs text-gray-400 leading-tight">{b.desc}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
