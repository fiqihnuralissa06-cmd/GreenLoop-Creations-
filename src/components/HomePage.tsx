import {ArrowRight} from 'lucide-react';
import type {PageId, PartnerOutlet, Product, User, WasteCollectionPoint} from '../types/schema';
import {PangkalpinangMap} from './PangkalpinangMap';
import {ProductCard} from './ProductCard';
import {ResilientImage} from './ResilientImage';

interface HomePageProps {
  products: Product[];
  collectionPoints: WasteCollectionPoint[];
  partnerOutlets: PartnerOutlet[];
  users: User[];
  onNavigate: (page: PageId) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (productId: string) => void;
}

export function HomePage({
  products,
  collectionPoints,
  partnerOutlets,
  users,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: HomePageProps) {
  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 3);
  const totalCollectedKg = collectionPoints.reduce((sum, pt) => sum + pt.current_load_kg, 0);
  const totalCapacityKg = collectionPoints.reduce((sum, pt) => sum + pt.capacity_kg, 0);

  return (
    <div className="space-y-20">
      {/* Hero Section: 2-Column Balanced Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2 sm:py-4">
            <div className="space-y-6">
              <div className="text-xs font-medium text-emerald-800 tracking-wide">
                Ekonomi Sirkular Kota Pangkalpinang · HDPE & PP
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl font-bold text-slate-950 leading-[1.12] tracking-tight max-w-xl"
                style={{textWrap: 'balance'}}
              >
                Mengubah Limbah Plastik Keras Menjadi Suvenir Pesisir Bernilai Tinggi
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                GreenLoop Creations mengumpulkan tutup botol minuman, jerigen, dan wadah kosmetik
                berbahan HDPE serta PP dari berbagai kecamatan di Pangkalpinang untuk diolah menjadi
                cinderamata wisata, wadah serbaguna, dan dekorasi rumah bertekstur marmer alami.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Jelajahi Katalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('map')}
                  className="inline-flex items-center gap-2 px-5 py-3 border border-slate-300 hover:border-emerald-800 text-slate-800 hover:text-emerald-900 text-sm font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Peta Drop-Off Pangkalpinang</span>
                </button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span>Tutup Botol HDPE (#2)</span>
              <span aria-hidden="true">·</span>
              <span>Kemasan Kosmetik PP (#5)</span>
              <span aria-hidden="true">·</span>
              <span>Produksi Lokal Bangka Belitung</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[320px] lg:min-h-[460px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <ResilientImage
                src="/src/assets/images/hero_recycled_craft_1795013839956.jpg"
                alt="Koleksi nampan, vas, dan tatakan gelas terrazzo daur ulang plastik HDPE GreenLoop Creations"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 4-Column Impact Metrics Strip directly beneath hero */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-white p-5 sm:p-6">
            <div className="text-xs text-slate-500">Plastik Keras Terkumpul</div>
            <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-emerald-900">
              {totalCollectedKg.toLocaleString('id-ID')} kg
            </div>
            <div className="mt-1 text-xs text-slate-500 tabular-nums">
              dari kapasitas {totalCapacityKg.toLocaleString('id-ID')} kg aktif
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6">
            <div className="text-xs text-slate-500">Jaringan Pangkalpinang</div>
            <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {collectionPoints.length + partnerOutlets.length} Lokasi
            </div>
            <div className="mt-1 text-xs text-slate-500 tabular-nums">
              {collectionPoints.length} titik drop-off · {partnerOutlets.length} mitra outlet
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6">
            <div className="text-xs text-slate-500">Estimasi Tutup Botol Terolah</div>
            <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {Math.round(totalCollectedKg * 400).toLocaleString('id-ID')}+
            </div>
            <div className="mt-1 text-xs text-slate-500">
              terselamatkan dari aliran pesisir
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6">
            <div className="text-xs text-slate-500">Material Lokal Terverifikasi</div>
            <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-[#b85c40]">
              100% HDPE / PP
            </div>
            <div className="mt-1 text-xs text-slate-500">
              tanpa cat pelapis kimia beracun
            </div>
          </div>
        </div>
      </section>

      {/* Circular Economy Promotion + Interactive Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-medium text-emerald-800">
                Pemetaan Geospasial Ekonomi Sirkular
              </div>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold text-slate-950 leading-tight"
                style={{textWrap: 'balance'}}
              >
                Setor Plastik Keras di Sekitar Anda, Bawa Pulang Karya Pangkalpinang
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pantau sebaran titik pengumpulan sampah plastik (<code className="font-mono text-xs text-emerald-900">waste_collection_points</code>)
                beserta kapasitas muatnya secara langsung, atau kunjungi mitra galeri oleh-oleh (
                <code className="font-mono text-xs text-[#b85c40]">partner_outlets</code>) di
                Taman Sari, Bukit Intan, Rangkui, hingga Girimaya.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200 text-sm">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-semibold text-emerald-900 mt-0.5">01.</span>
                  <span className="text-slate-700">
                    Pilahkan tutup botol HDPE dan kemasan kosmetik PP yang sudah dibilas bersih.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-semibold text-emerald-900 mt-0.5">02.</span>
                  <span className="text-slate-700">
                    Antarkan ke titik drop-off terdekat sesuai kapasitas yang terpantau di peta.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-semibold text-emerald-900 mt-0.5">03.</span>
                  <span className="text-slate-700">
                    Plastik dicetak panas menjadi suvenir wisata lokal yang tahan lama.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('map')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <span>Eksplorasi Peta Geospasial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <PangkalpinangMap
                collectionPoints={collectionPoints}
                partnerOutlets={partnerOutlets}
                users={users}
                compact={true}
                onOpenFullMap={() => onNavigate('map')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Best-Selling Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="text-xs font-medium text-emerald-800">Koleksi Pilihan</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 mt-1">
              Produk Terlaris Pangkalpinang
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <span>Lihat Semua {products.length} Produk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
