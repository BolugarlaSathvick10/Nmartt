"use client";

import { useAuthStore } from "@/store/auth-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useOrderStore } from "@/store/order-store";
import type {
  AuthRepository,
  CatalogRepository,
  MutationResult,
  OrderRepository,
  PlaceOrderInput,
} from "@/lib/repositories/contracts";
import type { OrderStatus, Product } from "@/types";

function toResult(ok: boolean, fallbackError: string): MutationResult {
  return ok ? { ok: true } : { ok: false, error: fallbackError };
}

class LocalCatalogRepository implements CatalogRepository {
  async getSnapshot() {
    const state = useCatalogStore.getState();
    return {
      categories: state.categories,
      products: state.products,
    };
  }

  async createCategory(category: { name: string; image?: string }) {
    const ok = useCatalogStore.getState().addCategory(category);
    return toResult(ok, "Not authorized to create category");
  }

  async createProduct(product: Product) {
    const ok = useCatalogStore.getState().addProduct(product);
    return toResult(ok, "Not authorized to create product");
  }

  async updateProduct(product: Product) {
    const ok = useCatalogStore.getState().updateProduct(product);
    return toResult(ok, "Not authorized to update product");
  }

  async updateProductPrice(productId: string, price: number) {
    const ok = useCatalogStore.getState().updatePrice(productId, price);
    return toResult(ok, "Not authorized to update price");
  }

  async deleteProduct(productId: string) {
    const ok = useCatalogStore.getState().deleteProduct(productId);
    return toResult(ok, "Not authorized to delete product");
  }

  async getProductActivities(limit = 50) {
    return useCatalogStore.getState().productActivities.slice(0, limit);
  }

  async clearProductActivities(olderThanDays?: number) {
    useCatalogStore.getState().clearProductActivities(olderThanDays);
    return { ok: true };
  }
}

class LocalAuthRepository implements AuthRepository {
  async getUsers() {
    return useAuthStore.getState().users;
  }

  async createUserAccount(input: { name: string; email: string; password: string; role: "admin" | "pm" | "delivery" | "user"; mobile?: string }) {
    const result = useAuthStore.getState().createManagedUser(input);
    return result.ok ? { ok: true, user: result.user } : { ok: false, error: result.error };
  }

  async setUserAccess(userId: string, blocked: boolean) {
    const result = useAuthStore.getState().setUserAccess(userId, blocked);
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  async login(identifier: string, password: string) {
    const result = useAuthStore.getState().login(identifier, password);
    if (!result.success) {
      return { ok: false, error: result.error };
    }

    return {
      ok: true,
      user: useAuthStore.getState().user ?? undefined,
      redirect: result.redirect,
    };
  }

  async requestPasswordResetOtp(mobile: string) {
    const result = useAuthStore.getState().requestPasswordResetOtp(mobile);
    return { ok: result.success, error: result.error };
  }

  async resetPasswordWithOtp(mobile: string, otp: string, newPassword: string) {
    const result = useAuthStore.getState().resetPasswordWithOtp(mobile, otp, newPassword);
    return { ok: result.success, error: result.error };
  }

  async signup(name: string, email: string, password: string, mobile?: string) {
    const result = useAuthStore.getState().signup(name, email, password, mobile);
    if (!result.success) {
      return { ok: false, error: result.error };
    }

    return { ok: true, user: useAuthStore.getState().user ?? undefined };
  }

  async getLoginActivities(limit = 50) {
    return useAuthStore.getState().loginActivities.slice(0, limit);
  }

  async clearLoginActivities(olderThanDays?: number) {
    useAuthStore.getState().clearLoginActivities(olderThanDays);
    return { ok: true };
  }

  async updateProfile(updates: {
    name?: string;
    mobile?: string;
    aadhaarNumber?: string;
    drivingLicenseNumber?: string;
    aadhaarImage?: string;
    drivingLicenseImage?: string;
    vehicleNumber?: string;
    address?: string;
  }) {
    const result = useAuthStore.getState().updateProfile(updates);
    return {
      ok: result.success,
      error: result.error,
    };
  }
}

class LocalOrderRepository implements OrderRepository {
  async getOrders() {
    return useOrderStore.getState().orders;
  }

  async placeOrder(input: PlaceOrderInput) {
    const order = useOrderStore.getState().placeOrder(input);
    return { ok: true, order };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const ok = useOrderStore.getState().updateOrderStatus(orderId, status);
    return toResult(ok, "Failed to update order status");
  }
}

export const localCatalogRepository = new LocalCatalogRepository();
export const localAuthRepository = new LocalAuthRepository();
export const localOrderRepository = new LocalOrderRepository();
