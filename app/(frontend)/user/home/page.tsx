"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getCatalogRepository, getDataSourceMode } from "@/lib/repositories";
import { localizeCategoryName, localizeProductName } from "@/lib/localization";
import { useCatalogStore, useCartStore, useUpcomingStore, useUIStore } from "@/store";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import { HorizontalProductScroll } from "@/components/horizontal-product-scroll";
import { ProductCard } from "@/components/product-card";
import { AppCard } from "@/components/layout/Card";

export default function UserHomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const dataSourceMode = getDataSourceMode();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const localProducts = useCatalogStore((state) => state.products);
  const localCategories = useCatalogStore((state) => state.categories);
  const [apiProducts, setApiProducts] = useState<typeof localProducts>([]);
  const [apiCategories, setApiCategories] = useState<typeof localCategories>([]);

  const isApiMode = dataSourceMode === "api";
  const products = isApiMode ? apiProducts : localProducts;
  const categories = isApiMode ? apiCategories : localCategories;

  useEffect(() => {
    if (!isApiMode) return;
    let active = true;
    const load = async () => {
      try {
        const snapshot = await getCatalogRepository().getSnapshot();
        if (!active) return;
        setApiProducts(snapshot.products);
        setApiCategories(snapshot.categories);
      } catch {
        if (!active) return;
        setApiProducts(localProducts);
        setApiCategories(localCategories);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isApiMode, localProducts, localCategories]);

  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  
  const cartOpen = useUIStore((s) => s.cartOpen);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const { addInterest, removeInterest, hasInterest, getCount } = useUpcomingStore();

  const regularProducts = useMemo(() => products.filter((p) => !p.upcoming), [products]);
  const upcomingProducts = useMemo(() => products.filter((p) => p.upcoming), [products]);

  const filtered = useMemo(() => {
    let list = regularProducts;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          localizeProductName(p.name, locale).toLowerCase().includes(q) ||
          localizeCategoryName(p.categoryName, locale).toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }

    return list;
  }, [regularProducts, search, categoryFilter, locale]);

  const inCart = (id: string) => items.find((i) => i.product.id === id);
  const getQty = (id: string) => inCart(id)?.quantity ?? 0;

  const hasSearchResults = search.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <AppCard className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("home.searchPlaceholder")}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pl-11 pr-4 outline-none focus:border-transparent focus:ring-2 focus:ring-green-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-green-500 md:w-52"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">{t("home.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {localizeCategoryName(c.name, locale)}
                </option>
              ))}
            </select>
          </div>
        </AppCard>
      </motion.section>

      <AnimatePresence>
        {hasSearchResults && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" />
              <h2 className="text-xl font-bold text-foreground">{t("home.searchResults")}</h2>
              <span className="text-sm text-muted-foreground">{t("home.productsFound", { count: filtered.length })}</span>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    quantity={getQty(p.id)}
                    onAdd={() => addItem(p)}
                    onIncrease={() => updateQuantity(p.id, getQty(p.id) + 1)}
                    onDecrease={() => updateQuantity(p.id, Math.max(0, getQty(p.id) - 1))}
                  />
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">{t("home.noSearchProducts")}</p>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {upcomingProducts.length > 0 && !hasSearchResults && (
          <HorizontalProductScroll
            products={upcomingProducts}
            isInterested={hasInterest}
            onNotifyMe={(id: string) => (hasInterest(id) ? removeInterest(id) : addInterest(id))}
            interestCount={getCount}
            title={t("home.upcomingTitle")}
            description={t("home.upcomingDescription")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!hasSearchResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {t("home.categories")}
              </h2>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={categoryFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter("all")}
                      className="rounded-full"
                    >
                      {t("home.all")}
                    </Button>
                  </motion.div>
                  {categories.map((c) => (
                    <motion.div key={c.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={categoryFilter === c.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(c.id)}
                        className="rounded-full"
                      >
                        {localizeCategoryName(c.name, locale)}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {categoryFilter === "all"
                  ? t("home.allProducts")
                  : localizeCategoryName(categories.find((c) => c.id === categoryFilter)?.name ?? "", locale)}
              </h2>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {filtered.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      quantity={getQty(p.id)}
                      onAdd={() => addItem(p)}
                      onIncrease={() => updateQuantity(p.id, getQty(p.id) + 1)}
                      onDecrease={() => updateQuantity(p.id, Math.max(0, getQty(p.id) - 1))}
                    />
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">{t("home.noCategoryProducts")}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </motion.div>
  );
}
