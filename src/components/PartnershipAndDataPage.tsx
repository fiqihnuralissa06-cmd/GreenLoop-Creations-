import {CheckCircle2, Mail, MapPin, Phone} from 'lucide-react';
import {FormEvent, useMemo, useState} from 'react';
import {PANGKALPINANG_DISTRICTS} from '../data/mockDatabase';
import type {
  Order,
  OrderStatus,
  PartnerOutlet,
  PartnershipApplication,
  Product,
  User,
  UserRole,
  WasteCollectionPoint,
} from '../types/schema';
import {formatDateID, formatIDR} from '../utils/formatters';

interface PartnershipAndDataPageProps {
  users: User[];
  orders: Order[];
  products: Product[];
  collectionPoints: WasteCollectionPoint[];
  partnerOutlets: PartnerOutlet[];
  applications: PartnershipApplication[];
  onSubmitApplication: (
    app: Omit<PartnershipApplication, 'id' | 'submitted_at'>,
  ) => PartnershipApplication;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDepositPlastic: (pointId: string, addedKg: number) => void;
}

type EntityKey = 'users' | 'orders' | 'waste_collection_points' | 'partner_outlets' | 'products';

const ORDER_STATUSES: OrderStatus[] = [
  'Menunggu Pembayaran',
  'Diproses',
  'Dikirim',
  'Selesai',
  'Dibatalkan',
];

export function PartnershipAndDataPage({
  users,
  orders,
  products,
  collectionPoints,
  partnerOutlets,
  applications,
  onSubmitApplication,
  onUpdateOrderStatus,
  onDepositPlastic,
}: PartnershipAndDataPageProps) {
  const [activeTab, setActiveTab] = useState<'partnership' | 'database'>('partnership');

  // Form state
  const [applicantName, setApplicantName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState<string>(PANGKALPINANG_DISTRICTS[0]);
  const [address, setAddress] = useState('');
  const [partnershipType, setPartnershipType] = useState<
    PartnershipApplication['partnership_type']
  >('Titik Pengumpulan Plastik (Drop-Off)');
  const [estimatedCapacity, setEstimatedCapacity] = useState('250');
  const [notes, setNotes] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState<PartnershipApplication | null>(null);

  // Database Simulation state
  const [activeEntity, setActiveEntity] = useState<EntityKey>('users');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const userLookup = useMemo(() => {
    const rec: Record<string, User> = {};
    for (const u of users) rec[u.id] = u;
    return rec;
  }, [users]);

  const pointLookup = useMemo(() => {
    const rec: Record<string, WasteCollectionPoint> = {};
    for (const p of collectionPoints) rec[p.id] = p;
    return rec;
  }, [collectionPoints]);

  const outletLookup = useMemo(() => {
    const rec: Record<string, PartnerOutlet> = {};
    for (const o of partnerOutlets) rec[o.id] = o;
    return rec;
  }, [partnerOutlets]);

  const filteredUsers = useMemo(
    () => (roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter)),
    [users, roleFilter],
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !organizationName.trim() || !email.trim() || !address.trim()) {
      return;
    }

    const created = onSubmitApplication({
      applicant_name: applicantName.trim(),
      organization_name: organizationName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      district,
      address: address.trim(),
      partnership_type: partnershipType,
      estimated_capacity_kg:
        partnershipType === 'Titik Pengumpulan Plastik (Drop-Off)'
          ? Number(estimatedCapacity) || 200
          : undefined,
      notes: notes.trim(),
    });
    setSubmittedNotice(created);
    setApplicantName('');
    setOrganizationName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="border-b border-slate-200 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-emerald-800">
            Kolaborasi Masyarakat & Arsitektur Data
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 mt-1">
            Kontak, Kemitraan & Simulasi Relasi Data
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Ajukan kemitraan titik pengumpulan plastik atau etalase suvenir di Pangkalpinang, serta
            tinjau simulasi keterhubungan entitas pengguna, pesanan, dan titik pengumpulan.
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab('partnership')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'partnership'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kontak & Kemitraan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Simulasi Relasi Data
          </button>
        </div>
      </div>

      {activeTab === 'partnership' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Info & Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-5">
              <h2 className="font-display text-xl font-bold text-slate-950">
                Hubungi Workshop Pangkalpinang
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kami membuka kolaborasi bagi komunitas pesisir, sekolah, hotel, kafe, serta toko
                oleh-oleh di seluruh kecamatan Kota Pangkalpinang untuk memperluas jangkauan daur
                ulang HDPE dan PP.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-200 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-800 mt-1 shrink-0" />
                  <span>
                    Jl. Merdeka No. 18, Kec. Taman Sari, Kota Pangkalpinang, Kepulauan Bangka
                    Belitung 33121
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span className="font-mono text-xs">(0717) 422-890 · +62 812-7104-8821</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span className="font-mono text-xs">kolaborasi@greenloop-pkp.id</span>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
              <div className="text-xs font-semibold text-slate-900">
                Pengajuan Kemitraan Terbaru ({applications.length})
              </div>
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">{app.organization_name}</span>
                      <span className="text-slate-500">{formatDateID(app.submitted_at)}</span>
                    </div>
                    <div className="text-emerald-800 font-medium">{app.partnership_type}</div>
                    <div className="text-slate-600">
                      Kec. {app.district} · PIC: {app.applicant_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Application Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">
                Formulir Kemitraan & Pengumpulan Plastik
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Lengkapi data berikut untuk mendaftarkan titik drop-off baru atau menjadi mitra
                outlet resmi GreenLoop Creations.
              </p>
            </div>

            {submittedNotice && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                <div>
                  Pengajuan atas nama <strong>{submittedNotice.organization_name}</strong> telah
                  dicatat dengan kode <span className="font-mono">{submittedNotice.id}</span>. Tim
                  kami akan menghubungi Anda dalam 2 hari kerja.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Contoh: Nadia Kurnia"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Usaha / Komunitas
                </label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Contoh: Bank Sampah Gabek Bersih"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Aktif</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@instansi.id"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nomor Telepon / WA</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Jenis Kemitraan</label>
                <select
                  value={partnershipType}
                  onChange={(e) =>
                    setPartnershipType(
                      e.target.value as PartnershipApplication['partnership_type'],
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                >
                  <option value="Titik Pengumpulan Plastik (Drop-Off)">
                    Titik Pengumpulan Plastik (Drop-Off)
                  </option>
                  <option value="Mitra Outlet Suvenir">Mitra Outlet Suvenir</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Kecamatan Lokasi</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                >
                  {PANGKALPINANG_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      Kec. {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {partnershipType === 'Titik Pengumpulan Plastik (Drop-Off)' && (
              <div className="text-xs">
                <label className="block font-medium text-slate-700 mb-1">
                  Estimasi Kapasitas Tampung Plastik Keras (kg)
                </label>
                <input
                  type="number"
                  min={50}
                  max={2000}
                  value={estimatedCapacity}
                  onChange={(e) => setEstimatedCapacity(e.target.value)}
                  className="w-full sm:w-56 px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                />
              </div>
            )}

            <div className="text-xs">
              <label className="block font-medium text-slate-700 mb-1">
                Alamat Lengkap Lokasi di Pangkalpinang
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nama jalan, nomor bangunan, kelurahan..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
              />
            </div>

            <div className="text-xs">
              <label className="block font-medium text-slate-700 mb-1">
                Catatan Tambahan / Jenis Plastik Dominan
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ceritakan potensi volume tutup botol HDPE/PP atau minat penjualan suvenir..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Kirim Pengajuan Kemitraan
            </button>
          </form>
        </div>
      ) : (
        /* Relational Data Simulation Dashboard */
        <div className="space-y-8">
          {/* Interactive Entity Relationship Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(
              [
                {
                  key: 'users',
                  title: 'users',
                  subtitle: 'customer · admin · partner',
                  count: users.length,
                  fk: 'PK: id -> orders, points, outlets',
                },
                {
                  key: 'orders',
                  title: 'orders',
                  subtitle: 'shipping_address · total_amount',
                  count: orders.length,
                  fk: 'FK: user_id, fulfillment_outlet_id',
                },
                {
                  key: 'waste_collection_points',
                  title: 'waste_collection_points',
                  subtitle: 'kapasitas kg · jenis plastik',
                  count: collectionPoints.length,
                  fk: 'FK: manager_user_id -> users.id',
                },
                {
                  key: 'partner_outlets',
                  title: 'partner_outlets',
                  subtitle: 'mitra suvenir Pangkalpinang',
                  count: partnerOutlets.length,
                  fk: 'FK: owner_user_id -> users.id',
                },
                {
                  key: 'products',
                  title: 'products',
                  subtitle: 'stock · weight_gram · IDR',
                  count: products.length,
                  fk: 'FK: collection_point_id',
                },
              ] as const
            ).map((entity) => {
              const isSelected = activeEntity === entity.key;
              return (
                <button
                  key={entity.key}
                  type="button"
                  onClick={() => setActiveEntity(entity.key)}
                  className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-emerald-800 bg-emerald-50/60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-emerald-900">
                      {entity.title}
                    </span>
                    <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
                      {entity.count}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">{entity.subtitle}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-100">
                    {entity.fk}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Entity Live Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {activeEntity === 'users' && (
              <>
                <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-base text-slate-900">
                      Entitas Pengguna (`users`)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Relasi peran pelanggan, pengelola titik pengumpulan, dan pemilik outlet mitra.
                    </p>
                  </div>
                  <div className="inline-flex p-1 bg-slate-100 rounded-lg">
                    {(['all', 'customer', 'admin', 'partner'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRoleFilter(role)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          roleFilter === role
                            ? 'bg-white text-slate-900 shadow-sm font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {role === 'all' ? 'Semua Peran' : role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="py-3 px-4 font-semibold">ID</th>
                        <th className="py-3 px-4 font-semibold">Nama & Email</th>
                        <th className="py-3 px-4 font-semibold">Peran (`role`)</th>
                        <th className="py-3 px-4 font-semibold">Kecamatan</th>
                        <th className="py-3 px-4 font-semibold">Entitas Terhubung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => {
                        const userOrders = orders.filter((o) => o.user_id === u.id);
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-mono font-medium text-slate-900">
                              {u.id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{u.name}</div>
                              <div className="text-slate-500 font-mono">{u.email}</div>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium text-emerald-900">
                              {u.role}
                            </td>
                            <td className="py-3 px-4 text-slate-700">Kec. {u.district}</td>
                            <td className="py-3 px-4 text-slate-600">
                              {u.managed_point_id &&
                                `Mengelola ${pointLookup[u.managed_point_id]?.name || u.managed_point_id}`}
                              {u.managed_outlet_id &&
                                `Mitra ${outletLookup[u.managed_outlet_id]?.name || u.managed_outlet_id}`}
                              {!u.managed_point_id &&
                                !u.managed_outlet_id &&
                                `${userOrders.length} pesanan terdaftar`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeEntity === 'orders' && (
              <>
                <div className="p-5 border-b border-slate-200">
                  <h2 className="font-semibold text-base text-slate-900">
                    Entitas Pesanan (`orders`)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Menghubungkan <code className="font-mono">user_id</code>, item produk,{' '}
                    <code className="font-mono">shipping_address</code>, dan{' '}
                    <code className="font-mono">fulfillment_outlet_id</code>.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="py-3 px-4 font-semibold">ID & Kode</th>
                        <th className="py-3 px-4 font-semibold">Relasi `user_id`</th>
                        <th className="py-3 px-4 font-semibold">`shipping_address`</th>
                        <th className="py-3 px-4 font-semibold">Outlet Pemroses</th>
                        <th className="py-3 px-4 font-semibold text-right">`total_amount`</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono">
                            <div className="font-semibold text-slate-900">{ord.order_code}</div>
                            <div className="text-slate-400">{ord.id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">
                              {userLookup[ord.user_id]?.name || ord.customer_name}
                            </div>
                            <div className="font-mono text-slate-400">{ord.user_id}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs text-slate-600">
                            {ord.shipping_address}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {outletLookup[ord.fulfillment_outlet_id]?.name ||
                              ord.fulfillment_outlet_id}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-emerald-900">
                            {formatIDR(ord.total_amount)}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              aria-label={`Ubah status ${ord.order_code}`}
                              value={ord.status}
                              onChange={(e) =>
                                onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                              }
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeEntity === 'waste_collection_points' && (
              <>
                <div className="p-5 border-b border-slate-200">
                  <h2 className="font-semibold text-base text-slate-900">
                    Entitas Titik Pengumpulan (`waste_collection_points`)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Simulasikan penambahan setoran plastik (+5 kg) untuk melihat perubahan kapasitas
                    dan status titik pengumpulan.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="py-3 px-4 font-semibold">ID & Nama Lokasi</th>
                        <th className="py-3 px-4 font-semibold">Jenis Plastik</th>
                        <th className="py-3 px-4 font-semibold">Kapasitas (kg)</th>
                        <th className="py-3 px-4 font-semibold">Pengelola (`manager_user_id`)</th>
                        <th className="py-3 px-4 font-semibold">Aksi Simulasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {collectionPoints.map((pt) => (
                        <tr key={pt.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{pt.name}</div>
                            <div className="text-slate-500">
                              <span className="font-mono">{pt.id}</span> · Kec. {pt.district}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-900">
                            {pt.accepted_plastic_types.join(', ')}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums">
                            {pt.current_load_kg} / {pt.capacity_kg} kg ({pt.status})
                          </td>
                          <td className="py-3 px-4">
                            <div>{userLookup[pt.manager_user_id]?.name || pt.manager_user_id}</div>
                            <div className="font-mono text-slate-400">{pt.manager_user_id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => onDepositPlastic(pt.id, 5)}
                              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
                            >
                              + Setor 5 kg
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeEntity === 'partner_outlets' && (
              <>
                <div className="p-5 border-b border-slate-200">
                  <h2 className="font-semibold text-base text-slate-900">
                    Entitas Mitra Outlet (`partner_outlets`)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="py-3 px-4 font-semibold">ID & Nama Outlet</th>
                        <th className="py-3 px-4 font-semibold">Alamat & Kecamatan</th>
                        <th className="py-3 px-4 font-semibold">Kategori Unggulan</th>
                        <th className="py-3 px-4 font-semibold">Pemilik (`owner_user_id`)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partnerOutlets.map((out) => (
                        <tr key={out.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{out.name}</div>
                            <div className="font-mono text-slate-400">{out.id}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {out.address} (Kec. {out.district})
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {out.featured_categories.join(' · ')}
                          </td>
                          <td className="py-3 px-4">
                            <div>{userLookup[out.owner_user_id]?.name || out.owner_user_id}</div>
                            <div className="font-mono text-slate-400">{out.owner_user_id}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeEntity === 'products' && (
              <>
                <div className="p-5 border-b border-slate-200">
                  <h2 className="font-semibold text-base text-slate-900">
                    Entitas Produk Daur Ulang (`products`)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="py-3 px-4 font-semibold">ID & Nama Produk</th>
                        <th className="py-3 px-4 font-semibold">Kategori & Polimer</th>
                        <th className="py-3 px-4 font-semibold text-right">Harga (IDR)</th>
                        <th className="py-3 px-4 font-semibold text-right">`weight_gram`</th>
                        <th className="py-3 px-4 font-semibold text-right">`stock`</th>
                        <th className="py-3 px-4 font-semibold">Asal Drop-Off</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{prod.name}</div>
                            <div className="font-mono text-slate-400">{prod.id}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {prod.category} · <span className="font-mono">{prod.plastic_type}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-900 font-semibold">
                            {formatIDR(prod.price_idr)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {prod.weight_gram} g
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {prod.stock}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {pointLookup[prod.collection_point_id]?.name || prod.collection_point_id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
