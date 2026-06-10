import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useProducts } from '../../lib/hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);

  // Sync input when URL changes (e.g. browser back/forward)
  useEffect(() => { setInputValue(query); }, [query]);

  const { products, loading } = useProducts({ search: query });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) setSearchParams({ q: inputValue.trim() });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          className="mb-6"
          crumbs={query
            ? [{ label: 'Search', href: '/search' }, { label: `"${query}"` }]
            : [{ label: 'Search' }]
          }
        />

        {/* Search bar */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus-within:border-[#009739] transition-colors">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
              autoFocus
            />
            {inputValue && (
              <button type="submit" className="px-3 py-1 bg-[#009739] text-white rounded-lg text-xs border-none cursor-pointer" style={{ fontWeight: 600 }}>
                Search
              </button>
            )}
          </form>
        </div>

        {/* Results header */}
        {query && (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-gray-900" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                {loading ? 'Searching…' : `${products.length} result${products.length !== 1 ? 's' : ''} for`}{' '}
                {!loading && <span className="text-[#009739]">"{query}"</span>}
              </h1>
            </div>
            <Link to="/shop" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 no-underline">
              <SlidersHorizontal className="w-4 h-4" /> Browse all
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!query && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Type something to search for products.</p>
          </div>
        )}

        {query && !loading && products.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-900 mb-1" style={{ fontWeight: 700 }}>No results found</p>
            <p className="text-gray-400 text-sm mb-5">Try a different keyword or browse our categories.</p>
            <Link to="/shop" className="px-5 py-2.5 bg-[#009739] text-white rounded-xl text-sm no-underline" style={{ fontWeight: 600 }}>
              Browse shop
            </Link>
          </div>
        )}

        {/* Product grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
