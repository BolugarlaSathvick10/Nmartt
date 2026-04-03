import type {
  Category,
  LoginActivity,
  Order,
  OrderStatus,
  Product,
  ProductActivity,
  User,
  UserRole,
} from "@/types";

export type MutationResult = {
  ok: boolean;
  error?: string;
};

export type CatalogSnapshot = {
  categories: Category[];
  products: Product[];
};

export type PlaceOrderInput = {
  userId: string;
  userName: string;
  userMobile: string;
  userAddress: string;
  items: Array<{ product: Product; quantity: number; unit: string; unitPrice: number }>;
};

export interface CatalogRepository {
  getSnapshot(): Promise<CatalogSnapshot>;
  createCategory(category: { name: string; image?: string }): Promise<MutationResult>;
  createProduct(product: Product): Promise<MutationResult>;
  updateProduct(product: Product): Promise<MutationResult>;
  updateProductPrice(productId: string, price: number): Promise<MutationResult>;
  deleteProduct(productId: string): Promise<MutationResult>;
  getProductActivities(limit?: number): Promise<ProductActivity[]>;
  clearProductActivities(olderThanDays?: number): Promise<MutationResult>;
}

export interface AuthRepository {
  getUsers(): Promise<User[]>;
  getLoginActivities(limit?: number): Promise<LoginActivity[]>;
  clearLoginActivities(olderThanDays?: number): Promise<MutationResult>;
  createUserAccount(input: { name: string; email: string; password: string; role: UserRole; mobile?: string }): Promise<{ ok: boolean; user?: User; error?: string }>;
  setUserAccess(userId: string, blocked: boolean): Promise<MutationResult>;
  login(email: string, password: string): Promise<{ ok: boolean; user?: User; redirect?: string; error?: string }>;
  signup(
    name: string,
    email: string,
    password: string,
    mobile?: string
  ): Promise<{ ok: boolean; user?: User; error?: string }>;
  updateProfile(updates: {
    name?: string;
    mobile?: string;
    aadhaarNumber?: string;
    drivingLicenseNumber?: string;
    aadhaarImage?: string;
    drivingLicenseImage?: string;
    vehicleNumber?: string;
    address?: string;
  }): Promise<MutationResult>;
}

export interface OrderRepository {
  getOrders(): Promise<Order[]>;
  placeOrder(input: PlaceOrderInput): Promise<{ ok: boolean; order?: Order; error?: string }>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<MutationResult>;
}
