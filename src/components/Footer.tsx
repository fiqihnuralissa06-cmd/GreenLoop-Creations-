import type {PageId} from '../types/schema';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export function Footer({onNavigate}: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/70 text-slate-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
          <div className="md:col-span-5 space-y-3">
            <div className="font-display text-lg font-bold text-emerald-950">
              GreenLoop Creations
            </div>
            <p className="text-sm leading-relaxed text-slate-600 max-w-md">
              Inisiatif ekonomi sirkular Kota Pangkalpinang yang mengolah limbah plastik keras
              HDPE dan PP menjadi suvenir wisata, wadah serbaguna, dan dekorasi rumah bernilai
              estetika tinggi.
            </p>
            <p className="text-xs text-slate-500">
              Workshop Utama: Jl. Merdeka No. 18, Kec. Taman Sari, Kota Pangkalpinang, Kepulauan
              Bangka Belitung 33121
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <div className="text-xs font-semibold text-slate-900">Navigasi</div>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  Katalog Produk
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('map')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  Peta Drop-Off & Outlet
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  Tentang Kami
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5">
            <div className="text-xs font-semibold text-slate-900">Kolaborasi & Transaksi</div>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('checkout')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  Keranjang & Pembayaran
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('partnership')}
                  className="hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  Kontak, Kemitraan & Simulasi Relasi Data
                </button>
              </li>
              <li className="text-xs text-slate-500 pt-1">
                Email: kolaborasi@greenloop-pkp.id · Telepon: (0717) 422-890
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 GreenLoop Creations Pangkalpinang. Ekonomi sirkular untuk pesisir Bangka
            Belitung yang bersih.
          </p>
          <p className="tabular-nums">Material Terverifikasi: HDPE (#2) & PP (#5)</p>
        </div>
      </div>
    </footer>
  );
}
