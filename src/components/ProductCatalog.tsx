import {Search} from 'lucide-react';
import {useMemo, useState} from 'react';
import type {PlasticType, Product, ProductCategory} from '../types/schema';
import {ProductCard} from './ProductCard';

interface ProductCatalogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (productId: string) => void;
}

const CATEGORIES: Array<'Semua' | ProductCategory> = [
  'Semua',
  'Suvenir Premium',
  'Dekorasi Rumah',
  'Wadah Ramah Lingkungan',
  'Aksesori Meja',
];

const PLASTIC_FILTERS: Array<'Semua' | PlasticType> = ['Semua', 'HDPE', 'PP', 'HDPE & PP'];

export function ProductCatalog({
  products,
  onSelectProduct,
  onAddToCart,
}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | ProductCategory>('Semua');
  const [selectedPlastic, setSelectedPlastic] = useState<'Semua' | PlasticType>('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'weight-desc'>(
    'featured',
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchPlastic =
        selectedPlastic === 'Semua' ||
        p.plastic_type === selectedPlastic ||
        (selectedPlastic !== 'HDPE & PP' && p.plastic_type.includes(selectedPlastic));
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.plastic_source.toLowerCase().includes(query);
      return matchCat && matchPlastic && matchSearch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_idr - b.price_idr;
      if (sortBy === 'price-desc') return b.price_idr - a.price_idr;
      if (sortBy === 'weight-desc') return b.weight_gram - a.weight_gram;
      return Number(b.is_best_seller) - Number(a.is_best_seller);
    });
  }, [products, selectedCategory, selectedPlastic, searchTerm, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-emerald-800">
            Kerajinan & Suvenir Ekonomi Sirkular
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950">
            Katalog Produk Daur Ulang
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Setiap produk dilengkapi rincian berat material (gram), jenis polimer plastik keras
            (HDPE/PP), ketersediaan stok, dan estimasi limbah tutup botol yang berhasil dialihkan.
          </p>
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Menampilkan <strong className="text-slate-900">{filteredProducts.length}</strong> dari{' '}
          {products.length} produk
        </div>
      </div>

      {/* Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Segmented Filter */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-white text-emerald-950 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari suvenir, nampan, HDPE..."
                aria-label="Cari produk di katalog"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-emerald-700"
              />
            </div>

            <select
              aria-label="Urutkan produk"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'weight-desc',
                )
              }
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              <option value="featured">Urutkan: Terlaris</option>
              <option value="price-asc">Harga: Terendah</option>
              <option value="price-desc">Harga: Tertinggi</option>
              <option value="weight-desc">Berat Plastik: Terbesar</option>
            </select>
          </div>
        </div>

        {/* Plastic Resin Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 mr-1">Filter Jenis Plastik:</span>
          {PLASTIC_FILTERS.map((plastic) => (
            <button
              key={plastic}
              type="button"
              onClick={() => setSelectedPlastic(plastic)}
              className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedPlastic === plastic
                  ? 'border-emerald-800 bg-emerald-800 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {plastic === 'Semua' ? 'Semua Polimer' : plastic}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 px-6 text-center border border-slate-200 rounded-xl bg-slate-50/60">
          <h3 className="text-base font-semibold text-slate-900">
            Produk tidak ditemukan untuk filter saat ini
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Coba atur ulang kata kunci pencarian atau pilih kategori polimer lainnya.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Semua');
              setSelectedPlastic('Semua');
              setSearchTerm('');
            }}
            className="mt-4 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Atur Ulang Filter
          </button>
        </div>
      )}
    </section>
  );
}
