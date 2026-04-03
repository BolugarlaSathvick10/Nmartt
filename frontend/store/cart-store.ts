import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { formatProductUnit, parseProductUnits } from "@/lib/product-units";

interface CartState {
  items: CartItem[];
  cartsByUser: Record<string, CartItem[]>;
  syncForCurrentUser: () => void;
  addItem: (product: Product, quantity?: number, unit?: string) => void;
  removeItem: (productId: string, unit?: string) => void;
  updateQuantity: (productId: string, quantity: number, unit?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
  getItemQuantity: (productId: string, unit?: string) => number;
}

function getCartKey() {
  return useAuthStore.getState().user?.id ?? "guest";
}

function normalizeUnit(product: Product, unit?: string) {
  return formatProductUnit(unit ?? parseProductUnits(product.unit)[0] ?? product.unit);
}

function normalizeCartItem(item: CartItem): CartItem {
  return {
    ...item,
    unit: normalizeUnit(item.product, item.unit),
  };
}

function normalizeCartItems(items: CartItem[]) {
  return items.map(normalizeCartItem);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartsByUser: {},
      syncForCurrentUser: () => {
        const key = getCartKey();
        const nextItems = normalizeCartItems(get().cartsByUser[key] ?? []);
        set({ items: nextItems });
      },
      addItem: (product: Product, quantity = 1, unit?: string) => {
        set((state) => {
          const key = getCartKey();
          const currentItems = normalizeCartItems(state.cartsByUser[key] ?? []);
          const selectedUnit = normalizeUnit(product, unit);
          const existing = currentItems.find((i) => i.product.id === product.id && i.unit === selectedUnit);
          const nextItems = existing
            ? currentItems.map((i) =>
                i.product.id === product.id && i.unit === selectedUnit ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...currentItems, { product, quantity, unit: selectedUnit }];

          return {
            items: nextItems,
            cartsByUser: { ...state.cartsByUser, [key]: nextItems },
          };
        });
      },
      removeItem: (productId: string, unit?: string) => {
        set((state) => {
          const key = getCartKey();
          const currentItems = normalizeCartItems(state.cartsByUser[key] ?? []);
          const selectedUnit = unit ? formatProductUnit(unit) : undefined;
          const nextItems = currentItems.filter(
            (i) => !(i.product.id === productId && (!selectedUnit || i.unit === selectedUnit))
          );
          return {
            items: nextItems,
            cartsByUser: { ...state.cartsByUser, [key]: nextItems },
          };
        });
      },
      updateQuantity: (productId: string, quantity: number, unit?: string) => {
        if (quantity <= 0) return get().removeItem(productId, unit);
        set((state) => {
          const key = getCartKey();
          const currentItems = normalizeCartItems(state.cartsByUser[key] ?? []);
          const selectedUnit = unit ? formatProductUnit(unit) : undefined;
          const nextItems = currentItems.map((i) =>
            i.product.id === productId && (!selectedUnit || i.unit === selectedUnit) ? { ...i, quantity } : i
          );

          return {
            items: nextItems,
            cartsByUser: { ...state.cartsByUser, [key]: nextItems },
          };
        });
      },
      clearCart: () =>
        set((state) => {
          const key = getCartKey();
          return {
            items: [],
            cartsByUser: { ...state.cartsByUser, [key]: [] },
          };
        }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalAmount: () =>
        get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      getItemQuantity: (productId: string, unit?: string) => {
        const selectedUnit = unit ? formatProductUnit(unit) : undefined;
        return (
          get().items.find((item) => item.product.id === productId && (!selectedUnit || item.unit === selectedUnit))
            ?.quantity ?? 0
        );
      },
    }),
    {
      name: "nmart-cart",
      merge: (persisted, current) => {
        const saved = persisted as Partial<CartState>;
        const cartsByUser = Object.fromEntries(
          Object.entries(saved.cartsByUser ?? { guest: saved.items ?? [] }).map(([key, items]) => [
            key,
            normalizeCartItems(items ?? []),
          ])
        );
        const key = getCartKey();

        return {
          ...current,
          ...saved,
          cartsByUser,
          items: cartsByUser[key] ?? [],
        };
      },
    }
  )
);

useAuthStore.subscribe((state, prevState) => {
  if (state.user?.id !== prevState.user?.id) {
    useCartStore.getState().syncForCurrentUser();
  }
});
