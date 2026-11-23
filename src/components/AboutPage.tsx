import {ArrowRight} from 'lucide-react';
import type {PageId} from '../types/schema';
import {ResilientImage} from './ResilientImage';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export function AboutPage({onNavigate}: AboutPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">
      {/* Header & Story */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="text-xs font-medium text-emerald-800">
              Misi Pesisir Pangkalpinang
            </div>
            <h1
              className="font-display text-3xl sm:text-4xl font-bold text-slate-950 leading-tight"
              style={{textWrap: 'balance'}}
            >
              Menjaga Pesisir Bangka Melalui Kriya Daur Ulang Plastik Keras
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Sebagai ibu kota Kepulauan Bangka Belitung, Pangkalpinang menghadapi tantangan
              akumulasi sampah plastik rumah tangga dan kemasan sekali pakai yang bermuara ke
              Sungai Rangkui, Pelabuhan Pangkalbalam, hingga garis Pantai Pasir Padi.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              GreenLoop Creations hadir menjembatani warga, bank sampah kecamatan, dan perajin
              lokal. Kami memfokuskan pengolahan pada plastik keras bernilai tinggi—terutama{' '}
              <strong className="text-slate-900">HDPE (High-Density Polyethylene)</strong> dari
              tutup botol dan jerigen, serta{' '}
              <strong className="text-slate-900">PP (Polypropylene)</strong> dari kemasan
              kosmetik dan wadah pangan—untuk diolah menjadi suvenir pariwisata khas Bangka.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <span>Lihat Jaringan Titik Pengumpulan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('partnership')}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 hover:border-emerald-800 text-slate-800 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <span>Bergabung Sebagai Mitra</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="h-full min-h-[300px] lg:min-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <ResilientImage
              src="/src/assets/images/about_coastal_workshop_1795013840962.jpg"
              alt="Workshop penyortiran tutup botol HDPE dan pengolahan kerajinan plastik di Pangkalpinang"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3-Step Craft Process */}
      <section className="border-t border-slate-200 pt-12 space-y-8">
        <div className="max-w-2xl">
          <div className="text-xs font-medium text-emerald-800">Alur Produksi Sirkular</div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 mt-1">
            Dari Limbah Terpilah Menjadi Buah Tangan Lokal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="font-mono text-sm font-semibold text-emerald-800">
              01. Pemilahan & Pencucian
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Pengumpulan Terlacak Per Kecamatan
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tutup botol HDPE dan kemasan kosmetik PP dikumpulkan di lima titik drop-off aktif,
              dipisahkan berdasarkan warna alami (hijau zamrud, putih, dan terakota), lalu dicuci
              bebas residu.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="font-mono text-sm font-semibold text-emerald-800">
              02. Pencacahan & Pengepresan
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Teknik Termo-Kompresi Tanpa Pewarna Tambahan
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Serpihan plastik keras dipanaskan pada suhu terkontrol untuk menciptakan lembaran
              atau cetakan berpola terrazzo organik tanpa mencampur resin beracun maupun cat
              sintetis.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="font-mono text-sm font-semibold text-emerald-800">
              03. Pemberdayaan Pariwisata
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Distribusi Melalui Mitra Outlet Daerah
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Produk akhir dipasarkan melalui galeri oleh-oleh dan koridor wisata seperti Pantai
              Pasir Padi serta Taman Sari, memberi nilai ekonomi baru bagi UMKM kreatif lokal.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
