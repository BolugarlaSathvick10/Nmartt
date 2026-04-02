import { create, type StoreApi, type UseBoundStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStarterCatalog } from "@/lib/catalog-seed";
import { useAuthStore } from "@/store/auth-store";
import type { Category, Product, ProductActivity, ProductActivityAction } from "@/types";

type CatalogState = {
  categories: Category[];
  products: Product[];
  productActivities: ProductActivity[];
  addProduct: (product: Product) => boolean;
  updateProduct: (product: Product) => boolean;
  updatePrice: (productId: string, price: number) => boolean;
  deleteProduct: (productId: string) => boolean;
  setProducts: (products: Product[]) => void;
  resetCatalog: () => void;
  getRecentProductActivities: (limit?: number) => ProductActivity[];
  clearProductActivities: (olderThanDays?: number) => void;
};

const starterCatalog = createStarterCatalog();

function recalculateCategories(categories: Category[], products: Product[]): Category[] {
  const counts = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1;
    return acc;
  }, {});

  return categories.map((category) => ({
    ...category,
    productCount: counts[category.id] ?? 0,
  }));
}

function normalizeProduct(product: Product): Product {
  return { ...product };
}

function createProductActivity(
  action: ProductActivityAction,
  product: Product,
  details?: { oldPrice?: number; newPrice?: number }
): ProductActivity {
  const actor = useAuthStore.getState().user;
  return {
    id: `prod-act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: product.id,
    productName: product.name,
    action,
    actorUserId: actor?.id,
    actorName: actor?.name,
    actorRole: actor?.role,
    oldPrice: details?.oldPrice,
    newPrice: details?.newPrice,
    timestamp: new Date().toISOString(),
  };
}

function pushActivity(state: CatalogState, activity: ProductActivity): ProductActivity[] {
  return [activity, ...state.productActivities].slice(0, 300);
}

function getActorRole() {
  return useAuthStore.getState().user?.role;
}

function canMutateCatalog() {
  const role = getActorRole();
  return role === "admin" || role === "pm";
}

function canDeleteCatalogItem() {
  return getActorRole() === "admin";
}

export const useCatalogStore: UseBoundStore<StoreApi<CatalogState>> = create<CatalogState>()(
  persist<CatalogState>(
    (set) => ({
      categories: starterCatalog.categories,
      products: starterCatalog.products,
      productActivities: [],
      addProduct: (product) => {
        if (!canMutateCatalog()) return false;
        const normalized = normalizeProduct(product);
        set((state) => {
          const nextProducts = [normalized, ...state.products.filter((item) => item.id !== normalized.id)];
          return {
            products: nextProducts,
            categories: recalculateCategories(state.categories, nextProducts),
            productActivities: pushActivity(
              state,
              createProductActivity("create", normalized)
            ),
          };
        });
        return true;
      },
      updateProduct: (product) => {
        if (!canMutateCatalog()) return false;
        const normalized = normalizeProduct(product);
        set((state) => {
          const nextProducts = state.products.map((item) => (item.id === normalized.id ? normalized : item));
          return {
            products: nextProducts,
            categories: recalculateCategories(state.categories, nextProducts),
            productActivities: pushActivity(
              state,
              createProductActivity("update", normalized)
            ),
          };
        });
        return true;
      },
      updatePrice: (productId, price) => {
        if (!canMutateCatalog()) return false;
        set((state) => {
          const existing = state.products.find((item) => item.id === productId);
          const nextProducts = state.products.map((item) =>
            item.id === productId ? { ...item, price } : item
          );
          return {
            products: nextProducts,
            categories: recalculateCategories(state.categories, nextProducts),
            productActivities:
              existing && existing.price !== price
                ? pushActivity(
                    state,
                    createProductActivity("update_price", { ...existing, price }, {
                      oldPrice: existing.price,
                      newPrice: price,
                    })
                  )
                : state.productActivities,
          };
        });
        return true;
      },
      deleteProduct: (productId) => {
        if (!canDeleteCatalogItem()) return false;
        set((state) => {
          const existing = state.products.find((item) => item.id === productId);
          const nextProducts = state.products.filter((item) => item.id !== productId);
          return {
            products: nextProducts,
            categories: recalculateCategories(state.categories, nextProducts),
            productActivities: existing
              ? pushActivity(
                  state,
                  createProductActivity("delete", existing)
                )
              : state.productActivities,
          };
        });
        return true;
      },
      setProducts: (products) => {
        set((state) => ({
          products: products.map(normalizeProduct),
          categories: recalculateCategories(state.categories, products),
        }));
      },
      resetCatalog: () => {
        set({
          categories: starterCatalog.categories,
          products: starterCatalog.products,
          productActivities: [],
        });
      },
      getRecentProductActivities: (limit = 20) =>
        useCatalogStore.getState().productActivities.slice(0, limit),
      clearProductActivities: (olderThanDays) => {
        if (olderThanDays == null) {
          set({ productActivities: [] });
          return;
        }

        const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
        set((state) => ({
          productActivities: state.productActivities.filter(
            (item) => new Date(item.timestamp).getTime() >= cutoff
          ),
        }));
      },
    }),
    {
      name: "nmart-catalog",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
