import type {PageId, PartnerOutlet, User, WasteCollectionPoint} from '../types/schema';
import {PangkalpinangMap} from './PangkalpinangMap';

interface MapExplorerPageProps {
  collectionPoints: WasteCollectionPoint[];
  partnerOutlets: PartnerOutlet[];
  users: User[];
  highlightedPointId: string | null;
  onDepositPlastic: (pointId: string, addedKg: number) => void;
  onNavigate: (page: PageId) => void;
}

export function MapExplorerPage({
  collectionPoints,
  partnerOutlets,
  users,
  highlightedPointId,
  onDepositPlastic,
  onNavigate,
}: MapExplorerPageProps) {
  const totalCapacity = collectionPoints.reduce((s, p) => s + p.capacity_kg, 0);
  const totalLoad = collectionPoints.reduce((s, p) => s + p.current_load_kg, 0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="border-b border-slate-200 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-emerald-800">
            Pemetaan Geospasial Kota Pangkalpinang
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950">
            Peta Titik Drop-Off & Mitra Outlet
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Telusuri sebaran lokasi pengumpulan plastik keras HDPE dan PP beserta sisa kapasitas
            tampung (kg), serta gerai mitra resmi penyedia suvenir daur ulang di Pangkalpinang.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs tabular-nums">
          <div>
            <div className="text-slate-500">Total Muatan Terkumpul</div>
            <div className="font-mono text-base font-bold text-emerald-900">
              {totalLoad.toLocaleString('id-ID')} / {totalCapacity.toLocaleString('id-ID')} kg
            </div>
          </div>
          <div>
            <div className="text-slate-500">Mitra Outlet Aktif</div>
            <div className="font-mono text-base font-bold text-[#b85c40]">
              {partnerOutlets.length} Gerai
            </div>
          </div>
        </div>
      </div>

      <PangkalpinangMap
        collectionPoints={collectionPoints}
        partnerOutlets={partnerOutlets}
        users={users}
        highlightedPointId={highlightedPointId}
        onDepositPlastic={onDepositPlastic}
        onBrowseCatalog={() => onNavigate('catalog')}
      />
    </section>
  );
}
