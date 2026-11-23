import {Minus, Plus, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {Product, WasteCollectionPoint} from '../types/schema';
import {formatIDR, formatWeight} from '../utils/formatters';
import {ResilientImage} from './ResilientImage';

interface ProductDetailModalProps {
  product: Product | null;
  collectionPoint?: WasteCollectionPoint;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onViewMapPoint: (pointId: string) => void;
}

export function ProductDetailModal({
  product,
  collectionPoint,
  onClose,
  onAddToCart,
  onViewMapPoint,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Image Panel */}
          <div className="md:col-span-6 bg-slate-50 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full aspect-[4/3] overflow-hidden rounded-lg bg-white border border-slate-200/80">
              <ResilientImage
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-emerald-800 font-medium">
                    {product.plastic_type}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Tutup detail produk"
                  onClick={onClose}
                  className="p-2 -mr-2 -mt-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2
                id="pdp-title"
                className="font-display text-2xl font-bold text-slate-900 mt-2 leading-snug"
              >
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-4">
                <span className="text-2xl font-semibold text-emerald-900 tabular-nums font-mono">
                  {formatIDR(product.price_idr)}
                </span>
                <span className="text-xs text-slate-500 tabular-nums">
                  Berat {formatWeight(product.weight_gram)} ·{' '}
                  {isOutOfStock ? 'Stok Habis' : `Stok tersedia: ${product.stock} unit`}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>

              {/* Environmental Impact & Traceability */}
              <div className="mt-5 pt-5 border-t border-slate-200 space-y-2.5 text-sm">
                <div>
                  <div className="text-xs font-semibold text-emerald-900">
                    Dampak Lingkungan & Kandungan Plastik
                  </div>
                  <p className="text-slate-600 mt-1 text-xs leading-relaxed">
                    {product.environmental_impact}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                  <div>
                    <div className="text-slate-500">Sumber Bahan Baku</div>
                    <div className="font-medium text-slate-800 mt-0.5">{product.plastic_source}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Setara Daur Ulang</div>
                    <div className="font-mono font-medium text-emerald-900 mt-0.5 tabular-nums">
                      ±{product.caps_equivalent} tutup botol
                    </div>
                  </div>
                </div>

                {collectionPoint && (
                  <div className="pt-2 text-xs flex items-center justify-between gap-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500">Asal Titik Pengumpulan: </span>
                      <span className="font-medium text-slate-800">{collectionPoint.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewMapPoint(collectionPoint.id);
                      }}
                      className="text-emerald-800 hover:text-emerald-950 font-semibold underline underline-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Lihat di Peta
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Controls */}
            <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
              <div className="inline-flex items-center border border-slate-300 rounded-lg">
                <button
                  type="button"
                  aria-label="Kurangi jumlah"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-mono font-semibold tabular-nums text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Tambah jumlah"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  onAddToCart(product.id, quantity);
                  onClose();
                }}
                className="flex-1 py-2.5 px-5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {isOutOfStock ? 'Stok Sedang Kosong' : 'Tambah ke Keranjang'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
