import {APIProvider} from '@vis.gl/react-google-maps';
import {CheckCircle2} from 'lucide-react';
import {useCallback, useEffect, useState} from 'react';
import {AboutPage} from './components/AboutPage';
import {CartCheckoutPage} from './components/CartCheckoutPage';
import {Footer} from './components/Footer';
import {HomePage} from './components/HomePage';
import {MapExplorerPage} from './components/MapExplorerPage';
import {Navbar} from './components/Navbar';
import {PartnershipAndDataPage} from './components/PartnershipAndDataPage';
import {ProductCatalog} from './components/ProductCatalog';
import {ProductDetailModal} from './components/ProductDetailModal';
import {
  INITIAL_APPLICATIONS,
  INITIAL_COLLECTION_POINTS,
  INITIAL_ORDERS,
  INITIAL_PARTNER_OUTLETS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
} from './data/mockDatabase';
import type {
  CartItem,
  Order,
  OrderStatus,
  PageId,
  PartnershipApplication,
  Product,
  WasteCollectionPoint,
} from './types/schema';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  (typeof __GOOGLE_MAPS_API_KEY__ !== 'undefined' ? __GOOGLE_MAPS_API_KEY__ : '');

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [collectionPoints, setCollectionPoints] =
    useState<WasteCollectionPoint[]>(INITIAL_COLLECTION_POINTS);
  const [partnerOutlets] = useState(INITIAL_PARTNER_OUTLETS);
  const [users] = useState(INITIAL_USERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [applications, setApplications] =
    useState<PartnershipApplication[]>(INITIAL_APPLICATIONS);
  const [cart, setCart] = useState<CartItem[]>([
    {product_id: 'PRD-001', quantity: 1},
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [highlightedPointId, setHighlightedPointId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  // Case A: Listen for Google Maps Platform quota/auth failures
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setGmpQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleNavigate = useCallback((page: PageId) => {
    setActivePage(page);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  const handleAddToCart = useCallback(
    (productId: string, qtyToAdd = 1) => {
      const target = products.find((p) => p.id === productId);
      if (!target || target.stock <= 0) return;

      setCart((prev) => {
        const existing = prev.find((item) => item.product_id === productId);
        if (existing) {
          const nextQty = Math.min(target.stock, existing.quantity + qtyToAdd);
          return prev.map((item) =>
            item.product_id === productId ? {...item, quantity: nextQty} : item,
          );
        }
        return [...prev, {product_id: productId, quantity: Math.min(target.stock, qtyToAdd)}];
      });

      showToast(`"${target.name}" ditambahkan ke keranjang.`);
    },
    [products, showToast],
  );

  const handleUpdateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((prev) => prev.filter((item) => item.product_id !== productId));
        return;
      }
      const target = products.find((p) => p.id === productId);
      const maxStock = target?.stock ?? quantity;
      setCart((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? {...item, quantity: Math.min(maxStock, quantity)}
            : item,
        ),
      );
    },
    [products],
  );

  const handleRemoveCartItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const handleCreateOrder = useCallback(
    (payload: {
      user_id: string;
      customer_name: string;
      shipping_address: string;
      district: string;
      phone: string;
      payment_method: Order['payment_method'];
      fulfillment_outlet_id: string;
      shipping_cost_idr: number;
    }): Order => {
      const orderItems = cart
        .map((c) => {
          const prod = products.find((p) => p.id === c.product_id);
          if (!prod) return null;
          return {
            product_id: prod.id,
            product_name: prod.name,
            quantity: c.quantity,
            unit_price_idr: prod.price_idr,
            weight_gram: prod.weight_gram,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.unit_price_idr * item.quantity,
        0,
      );
      const totalWeight = orderItems.reduce(
        (sum, item) => sum + item.weight_gram * item.quantity,
        0,
      );

      const nextNum = 105 + orders.length;
      const newOrder: Order = {
        id: `ORD-2026-${nextNum}`,
        order_code: `GLC-2611-0${nextNum}`,
        user_id: payload.user_id,
        customer_name: payload.customer_name,
        shipping_address: payload.shipping_address,
        district: payload.district,
        phone: payload.phone,
        payment_method: payload.payment_method,
        items: orderItems,
        total_weight_gram: totalWeight,
        shipping_cost_idr: payload.shipping_cost_idr,
        total_amount: subtotal + payload.shipping_cost_idr,
        status:
          payload.payment_method === 'COD Pangkalpinang'
            ? 'Diproses'
            : 'Menunggu Pembayaran',
        created_at: new Date().toISOString().slice(0, 10),
        fulfillment_outlet_id: payload.fulfillment_outlet_id,
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Decrement product stock
      setProducts((prev) =>
        prev.map((prod) => {
          const ordered = orderItems.find((i) => i.product_id === prod.id);
          if (!ordered) return prod;
          return {...prod, stock: Math.max(0, prod.stock - ordered.quantity)};
        }),
      );

      setCart([]);
      showToast(`Pesanan ${newOrder.order_code} berhasil dicatat.`);
      return newOrder;
    },
    [cart, orders.length, products, showToast],
  );

  const handleUpdateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? {...ord, status} : ord)),
      );
      showToast(`Status pesanan diperbarui ke "${status}".`);
    },
    [showToast],
  );

  const handleDepositPlastic = useCallback(
    (pointId: string, addedKg: number) => {
      setCollectionPoints((prev) =>
        prev.map((pt) => {
          if (pt.id !== pointId) return pt;
          const nextLoad = Math.min(pt.capacity_kg, pt.current_load_kg + addedKg);
          const ratio = nextLoad / pt.capacity_kg;
          const nextStatus: WasteCollectionPoint['status'] =
            ratio >= 0.85 ? 'Hampir Penuh' : 'Aktif';
          return {
            ...pt,
            current_load_kg: nextLoad,
            status: nextStatus,
          };
        }),
      );
      showToast(`Setoran +${addedKg} kg plastik keras tercatat.`);
    },
    [showToast],
  );

  const handleSubmitApplication = useCallback(
    (app: Omit<PartnershipApplication, 'id' | 'submitted_at'>): PartnershipApplication => {
      const created: PartnershipApplication = {
        ...app,
        id: `APP-00${applications.length + 1}`,
        submitted_at: new Date().toISOString().slice(0, 10),
      };
      setApplications((prev) => [created, ...prev]);
      showToast('Pengajuan kemitraan berhasil dikirim.');
      return created;
    },
    [applications.length, showToast],
  );

  const handleViewMapPoint = useCallback(
    (pointId: string) => {
      setHighlightedPointId(pointId);
      handleNavigate('map');
    },
    [handleNavigate],
  );

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={['places', 'marker']}
      language="id"
      region="ID"
    >
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        {gmpQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        <Navbar
          activePage={activePage}
          onNavigate={handleNavigate}
          cartCount={totalCartCount}
        />

        <main className="flex-1">
          {activePage === 'home' && (
            <HomePage
              products={products}
              collectionPoints={collectionPoints}
              partnerOutlets={partnerOutlets}
              users={users}
              onNavigate={handleNavigate}
              onSelectProduct={setSelectedProduct}
              onAddToCart={(id) => handleAddToCart(id, 1)}
            />
          )}

          {activePage === 'catalog' && (
            <ProductCatalog
              products={products}
              onSelectProduct={setSelectedProduct}
              onAddToCart={(id) => handleAddToCart(id, 1)}
            />
          )}

          {activePage === 'map' && (
            <MapExplorerPage
              collectionPoints={collectionPoints}
              partnerOutlets={partnerOutlets}
              users={users}
              highlightedPointId={highlightedPointId}
              onDepositPlastic={handleDepositPlastic}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'about' && <AboutPage onNavigate={handleNavigate} />}

          {activePage === 'checkout' && (
            <CartCheckoutPage
              cart={cart}
              products={products}
              orders={orders}
              users={users}
              partnerOutlets={partnerOutlets}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onCreateOrder={handleCreateOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'partnership' && (
            <PartnershipAndDataPage
              users={users}
              orders={orders}
              products={products}
              collectionPoints={collectionPoints}
              partnerOutlets={partnerOutlets}
              applications={applications}
              onSubmitApplication={handleSubmitApplication}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDepositPlastic={handleDepositPlastic}
            />
          )}
        </main>

        <Footer onNavigate={handleNavigate} />

        <ProductDetailModal
          product={selectedProduct}
          collectionPoint={
            selectedProduct
              ? collectionPoints.find((c) => c.id === selectedProduct.collection_point_id)
              : undefined
          }
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(id, qty) => handleAddToCart(id, qty)}
          onViewMapPoint={handleViewMapPoint}
        />

        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-950 text-white text-xs font-medium rounded-lg shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </APIProvider>
  );
}
