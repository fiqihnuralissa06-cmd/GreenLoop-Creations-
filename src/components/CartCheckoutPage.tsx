import {useMapsLibrary} from '@vis.gl/react-google-maps';
import {CheckCircle2, MapPin, Minus, Plus, ShoppingBag, Trash2} from 'lucide-react';
import {FormEvent, useEffect, useMemo, useRef, useState} from 'react';
import {
  PANGKALPINANG_CENTER,
  PANGKALPINANG_DISTRICTS,
  SHIPPING_RATES_IDR,
} from '../data/mockDatabase';
import type {
  CartItem,
  Order,
  OrderStatus,
  PageId,
  PartnerOutlet,
  Product,
  User,
} from '../types/schema';
import {formatDateID, formatIDR, formatWeight} from '../utils/formatters';
import {ResilientImage} from './ResilientImage';

interface CartCheckoutPageProps {
  cart: CartItem[];
  products: Product[];
  orders: Order[];
  users: User[];
  partnerOutlets: PartnerOutlet[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCreateOrder: (payload: {
    user_id: string;
    customer_name: string;
    shipping_address: string;
    district: string;
    phone: string;
    payment_method: Order['payment_method'];
    fulfillment_outlet_id: string;
    shipping_cost_idr: number;
  }) => Order;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onNavigate: (page: PageId) => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'Menunggu Pembayaran',
  'Diproses',
  'Dikirim',
  'Selesai',
  'Dibatalkan',
];

export function CartCheckoutPage({
  cart,
  products,
  orders,
  users,
  partnerOutlets,
  onUpdateQuantity,
  onRemoveItem,
  onCreateOrder,
  onUpdateOrderStatus,
  onNavigate,
}: CartCheckoutPageProps) {
  const placesLib = useMapsLibrary('places');

  const customerUsers = useMemo(
    () => users.filter((u) => u.role === 'customer'),
    [users],
  );

  const [selectedUserId, setSelectedUserId] = useState(
    customerUsers[0]?.id || users[0]?.id || '',
  );
  const [customerName, setCustomerName] = useState(customerUsers[0]?.name || 'Siti Marwah');
  const [phone, setPhone] = useState(customerUsers[0]?.phone || '0821-7954-1208');
  const [district, setDistrict] = useState<string>(
    customerUsers[0]?.district || PANGKALPINANG_DISTRICTS[0],
  );
  const [shippingAddress, setShippingAddress] = useState(
    'Jl. Depati Amir No. 27, Kel. Melintang, Kec. Rangkui, Kota Pangkalpinang',
  );
  const [paymentMethod, setPaymentMethod] =
    useState<Order['payment_method']>('QRIS / Transfer Bank');
  const [fulfillmentOutletId, setFulfillmentOutletId] = useState(
    partnerOutlets[0]?.id || 'OUT-001',
  );
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');

  // Places API (New) address autocomplete for shipping_address
  const [addressSuggestions, setAddressSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    const found = users.find((u) => u.id === selectedUserId);
    if (found) {
      setCustomerName(found.name);
      setPhone(found.phone);
      setDistrict(found.district);
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    if (!placesLib || !showSuggestions) return;
    const trimmed = shippingAddress.trim();
    if (trimmed.length < 4) {
      setAddressSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }
        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['id'],
          locationBias: {
            center: PANGKALPINANG_CENTER,
            radius: 15000,
          },
        });
        setAddressSuggestions(res.suggestions || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429') || msg.includes('Quota')) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setAddressSuggestions([]);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [placesLib, shippingAddress, showSuggestions]);

  const productLookup = useMemo(() => {
    const rec: Record<string, Product> = {};
    for (const p of products) rec[p.id] = p;
    return rec;
  }, [products]);

  const cartDetails = useMemo(() => {
    return cart
      .map((item) => {
        const product = productLookup[item.product_id];
        if (!product) return null;
        return {
          ...item,
          product,
          lineTotal: product.price_idr * item.quantity,
          lineWeight: product.weight_gram * item.quantity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, productLookup]);

  const subtotal = cartDetails.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalWeight = cartDetails.reduce((sum, item) => sum + item.lineWeight, 0);
  const shippingCost =
    cartDetails.length === 0 || paymentMethod === 'Ambil di Mitra Outlet'
      ? 0
      : SHIPPING_RATES_IDR[district] ?? 12000;
  const totalAmount = subtotal + shippingCost;

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (cartDetails.length === 0) return;
    if (!customerName.trim() || !shippingAddress.trim() || !phone.trim()) return;

    const created = onCreateOrder({
      user_id: selectedUserId,
      customer_name: customerName.trim(),
      shipping_address: shippingAddress.trim(),
      district,
      phone: phone.trim(),
      payment_method: paymentMethod,
      fulfillment_outlet_id: fulfillmentOutletId,
      shipping_cost_idr: shippingCost,
    });
    setLatestOrder(created);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-emerald-800">
            Transaksi & Pelacakan Pesanan
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 mt-1">
            Keranjang & Pembayaran
          </h1>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'cart'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Keranjang Belanja ({cartDetails.reduce((s, i) => s + i.quantity, 0)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kelola Status Pesanan ({orders.length})
          </button>
        </div>
      </div>

      {/* Confirmation Banner after placing order */}
      {latestOrder && activeTab === 'cart' && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-800 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-emerald-950">
                Pesanan {latestOrder.order_code} Berhasil Dibuat — Status: {latestOrder.status}
              </div>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                Tujuan pengiriman: {latestOrder.shipping_address}. Total pembayaran:{' '}
                <span className="font-mono font-semibold">
                  {formatIDR(latestOrder.total_amount)}
                </span>
                .
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Lihat & Kelola Pesanan
          </button>
        </div>
      )}

      {activeTab === 'cart' ? (
        cartDetails.length === 0 ? (
          <div className="py-16 px-6 text-center border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
            <ShoppingBag className="w-10 h-10 text-emerald-700 mx-auto" strokeWidth={1.5} />
            <div className="space-y-1">
              <h2 className="font-display text-xl font-semibold text-slate-900">
                Keranjang Belanja Masih Kosong
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Pilih suvenir daur ulang HDPE/PP atau aksesori meja khas Pangkalpinang dari katalog
                kami.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Buka Katalog Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Itemized Cart List */}
            <div className="lg:col-span-7 space-y-4">
              {cartDetails.map(({product, quantity, lineTotal, lineWeight}) => (
                <div
                  key={product.id}
                  className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <div className="w-full sm:w-28 aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <ResilientImage
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500">
                      {product.category} · <span className="font-mono">{product.plastic_type}</span>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 mt-0.5 truncate">
                      {product.name}
                    </h3>
                    <div className="mt-1 text-xs text-slate-500 tabular-nums">
                      Berat total: {formatWeight(lineWeight)} · Harga satuan{' '}
                      <span className="font-mono">{formatIDR(product.price_idr)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="inline-flex items-center border border-slate-200 rounded-lg">
                      <button
                        type="button"
                        aria-label={`Kurangi ${product.name}`}
                        onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                        className="p-2 text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-mono font-semibold tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Tambah ${product.name}`}
                        disabled={quantity >= product.stock}
                        onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                        className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold font-mono tabular-nums text-emerald-950">
                        {formatIDR(lineTotal)}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(product.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-700 mt-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Shipping & Checkout Form */}
            <form
              onSubmit={handleCheckoutSubmit}
              className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5"
            >
              <h2 className="font-display text-xl font-bold text-slate-950">
                Rincian Pengiriman & Pembayaran
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Akun Pelanggan (Simulasi Relasi `users`)
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role}) — {u.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nama Penerima</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nomor WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Kecamatan Tujuan
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                    >
                      {PANGKALPINANG_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          Kec. {dist} ({formatIDR(SHIPPING_RATES_IDR[dist] ?? 12000)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as Order['payment_method'])
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                    >
                      <option value="QRIS / Transfer Bank">QRIS / Transfer Bank</option>
                      <option value="COD Pangkalpinang">COD Kurir Lokal Pangkalpinang</option>
                      <option value="Ambil di Mitra Outlet">Ambil di Mitra Outlet (Gratis Ongkir)</option>
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <label className="block font-medium text-slate-700 mb-1">
                    Alamat Pengiriman (<code className="font-mono">shipping_address</code>)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={shippingAddress}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => window.setTimeout(() => setShowSuggestions(false), 180)}
                    onChange={(e) => {
                      setShippingAddress(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="Masukkan alamat lengkap di Kota Pangkalpinang..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                  />

                  {showSuggestions && addressSuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100 max-h-44 overflow-y-auto">
                      {addressSuggestions.map((sug, idx) => (
                        <li key={idx}>
                          <button
                            type="button"
                            onMouseDown={async () => {
                              if (!sug.placePrediction) return;
                              const place = sug.placePrediction.toPlace();
                              try {
                                await place.fetchFields({fields: ['formattedAddress']});
                                setShippingAddress(
                                  place.formattedAddress || sug.placePrediction.text.text,
                                );
                              } catch {
                                setShippingAddress(sug.placePrediction.text.text);
                              }
                              sessionTokenRef.current = null;
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 flex items-start gap-2 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                            <span>{sug.placePrediction?.text.text}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Outlet Mitra Pemrosesan
                  </label>
                  <select
                    value={fulfillmentOutletId}
                    onChange={(e) => setFulfillmentOutletId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
                  >
                    {partnerOutlets.map((out) => (
                      <option key={out.id} value={out.id}>
                        {out.name} ({out.district})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="pt-4 border-t border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Produk ({formatWeight(totalWeight)})</span>
                  <span className="font-mono tabular-nums">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({district})</span>
                  <span className="font-mono tabular-nums">
                    {shippingCost === 0 ? 'Gratis' : formatIDR(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-950">
                  <span>Total Pembayaran (`total_amount`)</span>
                  <span className="font-mono tabular-nums text-emerald-900">
                    {formatIDR(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Konfirmasi & Buat Pesanan
              </button>
            </form>
          </div>
        )
      ) : (
        /* Order Status Management Table */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-base text-slate-900">
                Daftar Pesanan & Manajemen Status (`orders`)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbarui status pemenuhan pesanan secara langsung dari menunggu pembayaran hingga
                pesanan selesai diterima.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              Total {orders.length} transaksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-3 px-4 font-semibold">Kode & Tanggal</th>
                  <th className="py-3 px-4 font-semibold">Pelanggan & Alamat (`shipping_address`)</th>
                  <th className="py-3 px-4 font-semibold">Item & Berat</th>
                  <th className="py-3 px-4 font-semibold text-right">Total (`total_amount`)</th>
                  <th className="py-3 px-4 font-semibold">Status Pesanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 align-top">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-900">
                        {order.order_code}
                      </div>
                      <div className="text-slate-500 mt-0.5">{formatDateID(order.created_at)}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900">{order.customer_name}</div>
                      <div className="text-slate-600 mt-0.5 leading-relaxed">
                        {order.shipping_address}
                      </div>
                      <div className="text-slate-400 mt-0.5">{order.payment_method}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <ul className="space-y-0.5 text-slate-700">
                        {order.items.map((it) => (
                          <li key={it.product_id}>
                            {it.quantity}× {it.product_name}
                          </li>
                        ))}
                      </ul>
                      <div className="text-slate-500 font-mono tabular-nums mt-1">
                        Total berat: {formatWeight(order.total_weight_gram)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-emerald-900 whitespace-nowrap">
                      {formatIDR(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        aria-label={`Ubah status pesanan ${order.order_code}`}
                        value={order.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-md text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-700"
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
        </div>
      )}
    </section>
  );
}
