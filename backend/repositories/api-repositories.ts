"use client";

import { useAuthStore } from "@/store/auth-store";
import type {
  AuthRepository,
  CatalogRepository,
  MutationResult,
  OrderRepository,
  PlaceOrderInput,
} from "@/lib/repositories/contracts";
import type { OrderStatus, Product } from "@/types";

function authHeaders() {
  const user = useAuthStore.getState().user;
  const role = useAuthStore.getState().user?.role;
  return {
    ...(role ? { "x-user-role": role } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
  };
}

async function parseResult(response: Response, fallbackError: string): Promise<MutationResult> {
  if (response.ok) return { ok: true };

  try {
    const data = (await response.json()) as { error?: string };
    return { ok: false, error: data.error ?? fallbackError };
  } catch {
    return { ok: false, error: fallbackError };
  }
}

class ApiCatalogRepository implements CatalogRepository {
  async getSnapshot() {
    const response = await fetch("/api/catalog", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch catalog snapshot");
    }
    return response.json();
  }

  async createCategory(category: { name: string; image?: string }) {
    const response = await fetch("/api/catalog/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(category),
    });
    return parseResult(response, "Failed to create category");
  }

  async createProduct(product: Product) {
    const response = await fetch("/api/catalog/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(product),
    });
    return parseResult(response, "Failed to create product");
  }

  async updateProduct(product: Product) {
    const response = await fetch(`/api/catalog/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(product),
    });
    return parseResult(response, "Failed to update product");
  }

  async updateProductPrice(productId: string, price: number) {
    const response = await fetch(`/api/catalog/products/${productId}/price`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ price }),
    });
    return parseResult(response, "Failed to update product price");
  }

  async deleteProduct(productId: string) {
    const response = await fetch(`/api/catalog/products/${productId}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseResult(response, "Failed to delete product");
  }

  async getProductActivities(limit = 50) {
    const response = await fetch(`/api/catalog/activities?limit=${limit}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch product activities");
    }
    return response.json();
  }

  async clearProductActivities(olderThanDays?: number) {
    const suffix = olderThanDays == null ? "" : `?olderThanDays=${olderThanDays}`;
    const response = await fetch(`/api/catalog/activities${suffix}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseResult(response, "Failed to clear product activities");
  }
}

class ApiAuthRepository implements AuthRepository {
  async getUsers() {
    const response = await fetch("/api/users", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  }

  async createUserAccount(input: { name: string; email: string; password: string; role: "admin" | "pm" | "delivery" | "user"; mobile?: string }) {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const failed = await parseResult(response, "Failed to create user account");
      return { ok: false, error: failed.error };
    }

    const data = (await response.json()) as { user?: unknown };
    return { ok: true, user: data.user as any };
  }

  async setUserAccess(userId: string, blocked: boolean) {
    const response = await fetch(`/api/users/${userId}/access`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ blocked }),
    });
    return parseResult(response, "Failed to update user access");
  }

  async login(identifier: string, password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const failed = await parseResult(response, "Failed to log in");
      return { ok: false, error: failed.error };
    }

    const data = (await response.json()) as { user?: unknown; redirect?: string };
    return { ok: true, user: data.user as any, redirect: data.redirect };
  }

  async requestPasswordResetOtp(mobile: string) {
    const response = await fetch("/api/auth/forgot-password/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    return parseResult(response, "Failed to send OTP");
  }

  async resetPasswordWithOtp(mobile: string, otp: string, newPassword: string) {
    const response = await fetch("/api/auth/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, otp, newPassword }),
    });
    return parseResult(response, "Failed to reset password");
  }

  async signup(name: string, email: string, password: string, mobile?: string) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, mobile }),
    });

    if (!response.ok) {
      const failed = await parseResult(response, "Failed to sign up");
      return { ok: false, error: failed.error };
    }

    const data = (await response.json()) as { user?: unknown };
    return { ok: true, user: data.user as any };
  }

  async getLoginActivities(limit = 50) {
    const response = await fetch(`/api/auth/activities?limit=${limit}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch login activities");
    }
    return response.json();
  }

  async clearLoginActivities(olderThanDays?: number) {
    const suffix = olderThanDays == null ? "" : `?olderThanDays=${olderThanDays}`;
    const response = await fetch(`/api/auth/activities${suffix}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return parseResult(response, "Failed to clear login activities");
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
    const response = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(updates),
    });
    const result = await parseResult(response, "Failed to update profile");
    if (result.ok) {
      useAuthStore.getState().updateProfile(updates);
    }
    return result;
  }
}

class ApiOrderRepository implements OrderRepository {
  async getOrders() {
    const response = await fetch("/api/orders", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return response.json();
  }

  async placeOrder(input: PlaceOrderInput) {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const failed = await parseResult(response, "Failed to place order");
      return { ok: false, error: failed.error };
    }
    const data = (await response.json()) as { order: unknown };
    return { ok: true, order: data.order as any };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status }),
    });
    return parseResult(response, "Failed to update order status");
  }
}

export const apiCatalogRepository = new ApiCatalogRepository();
export const apiAuthRepository = new ApiAuthRepository();
export const apiOrderRepository = new ApiOrderRepository();
