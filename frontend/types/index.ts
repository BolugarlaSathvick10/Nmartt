export type UserRole = "admin" | "pm" | "delivery" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  avatar?: string;
  blocked?: boolean;
}

export type AuthMethod = "password" | "otp" | "signup";
export type AuthStatus = "success" | "failed";

export interface LoginActivity {
  id: string;
  userId?: string;
  email: string;
  role?: UserRole;
  method: AuthMethod;
  status: AuthStatus;
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  categoryId: string;
  categoryName: string;
  stock: number;
  unit: string;
  createdAt: string;
  /** When true, product is in "Upcoming" section; users can show interest (Notify me) */
  upcoming?: boolean;
}

export type ProductActivityAction = "create" | "update" | "update_price" | "delete";

export interface ProductActivity {
  id: string;
  productId: string;
  productName: string;
  action: ProductActivityAction;
  actorUserId?: string;
  actorName?: string;
  actorRole?: UserRole;
  oldPrice?: number;
  newPrice?: number;
  timestamp: string;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "rejected";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit?: string;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  userAddress: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit: string;
}

export interface DashboardStats {
  totalSales: number;
  ordersToday: number;
  totalProducts: number;
  activeUsers: number;
  pendingOrders?: number;
  earnings?: number;
}

export interface SalesChartData {
  date: string;
  sales: number;
  orders: number;
}
