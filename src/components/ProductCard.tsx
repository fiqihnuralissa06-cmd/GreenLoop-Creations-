import {Plus} from 'lucide-react';
import type {Product} from '../types/schema';
import {formatIDR, formatWeight} from '../utils/formatters';
import {ResilientImage} from './ResilientImage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (productId: string) => void;
}

export function ProductCard({product, onSelect, onAddToCart}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="text-left focus-visible:outline-2 focus-visible:outline-emerald-700 cursor-pointer"
      >
        <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden">
          <ResilientImage
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </button>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-800 font-medium">{product.plastic_type}</span>
          </div>

          <button
            type="button"
            onClick={() => onSelect(product)}
            className="mt-1.5 text-left block w-full cursor-pointer"
          >
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
              {product.name}
            </h3>
          </button>

          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.environmental_impact}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold text-emerald-950 font-mono tabular-nums">
              {formatIDR(product.price_idr)}
            </div>
            <div className="text-xs text-slate-500 tabular-nums mt-0.5">
              {formatWeight(product.weight_gram)} · Stok {product.stock}
            </div>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-800 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Habis' : 'Keranjang'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
