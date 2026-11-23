export type PageId =
  | 'home'
  | 'catalog'
  | 'map'
  | 'about'
  | 'checkout'
  | 'partnership';

export type UserRole = 'customer' | 'admin' | 'partner';

export type PlasticType = 'HDPE' | 'PP' | 'HDPE & PP';

export type ProductCategory =
  | 'Suvenir Premium'
  | 'Dekorasi Rumah'
  | 'Wadah Ramah Lingkungan'
  | 'Aksesori Meja';

export type OrderStatus =
  | 'Menunggu Pembayaran'
  | 'Diproses'
  | 'Dikirim'
  | 'Selesai'
  | 'Dibatalkan';

export type CollectionPointStatus = 'Aktif' | 'Hampir Penuh' | 'Perawatan';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  district: string;
  joined_at: string;
  managed_point_id?: string;
  managed_outlet_id?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  plastic_type: PlasticType;
  price_idr: number;
  stock: number;
  weight_gram: number;
  description: string;
  environmental_impact: string;
  plastic_source: string;
  caps_equivalent: number;
  image_url: string;
  is_best_seller: boolean;
  collection_point_id: string;
}

export interface WasteCollectionPoint {
  id: string;
  name: string;
  district: string;
  address: string;
  search_query: string;
  lat: number;
  lng: number;
  capacity_kg: number;
  current_load_kg: number;
  accepted_plastic_types: PlasticType[];
  operational_hours: string;
  manager_user_id: string;
  status: CollectionPointStatus;
}

export interface PartnerOutlet {
  id: string;
  name: string;
  district: string;
  address: string;
  search_query: string;
  lat: number;
  lng: number;
  owner_user_id: string;
  partner_type: string;
  featured_categories: ProductCategory[];
  opening_hours: string;
  phone: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price_idr: number;
  weight_gram: number;
}

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  customer_name: string;
  shipping_address: string;
  district: string;
  phone: string;
  payment_method: 'QRIS / Transfer Bank' | 'COD Pangkalpinang' | 'Ambil di Mitra Outlet';
  items: OrderItem[];
  total_weight_gram: number;
  shipping_cost_idr: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  fulfillment_outlet_id: string;
}

export interface PartnershipApplication {
  id: string;
  applicant_name: string;
  organization_name: string;
  email: string;
  phone: string;
  district: string;
  address: string;
  partnership_type: 'Titik Pengumpulan Plastik (Drop-Off)' | 'Mitra Outlet Suvenir';
  estimated_capacity_kg?: number;
  notes: string;
  submitted_at: string;
}
