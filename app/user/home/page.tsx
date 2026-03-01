"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Bell } from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { useCartStore, useUpcomingStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductCard } from "@/components/product-card";
import { HorizontalProductScroll } from "@/components/horizontal-product-scroll";

const upcomingProducts = MOCK_PRODUCTS.filter((p) => p.upcoming);
const regularProducts = MOCK_PRODUCTS.filter((p) => !p.upcoming);

export default function UserHomePage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalItems = useCartStore((s) => s.totalItems);
  const { addInterest, hasInterest, getCount } = useUpcomingStore();

  const filtered = useMemo(() => {
    let list = regularProducts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all")
      list = list.filter((p) => p.categoryId === categoryFilter);
    return list;
  }, [search, categoryFilter]);

  const inCart = (id: string) => items.find((i) => i.product.id === id);
  const getQty = (id: string) => inCart(id)?.quantity ?? 0;

  const hasSearchResults = search.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            N-Mart
          </h1>
          <p className="text-muted-foreground mt-1">Fresh groceries delivered to your door</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="lg"
            className="relative shadow-lg hover:shadow-primary/20 border-primary/20 hover:border-primary/40"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart
            <AnimatePresence>
              {totalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/90 text-xs text-white font-bold shadow-lg"
                >
                  {totalItems()}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 sm:flex-row bg-gradient-to-br from-primary/5 to-primary/0 rounded-xl p-4 border border-primary/10"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          <Input
            placeholder="Search for products or categories..."
            className="pl-10 bg-background/80 border-primary/20 focus:border-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background/80 border-primary/20 focus:border-primary/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-background border border-primary/20">
            <SelectItem value="all">All categories</SelectItem>
            {MOCK_CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Search Results Section (appears when searching) */}
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
              <h2 className="text-xl font-bold text-foreground">
                Search Results
              </h2>
              <span className="text-sm text-muted-foreground">
                ({filtered.length} products found)
              </span>
            </div>

            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filtered.map((p, i) => (
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No products found matching your search</p>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Upcoming Products Section */}
      <AnimatePresence>
        {upcomingProducts.length > 0 && !hasSearchResults && (
          <HorizontalProductScroll
            products={upcomingProducts}
            isInterested={hasInterest}
            onNotifyMe={addInterest}
            interestCount={getCount}
            title="Upcoming Products"
            description="Show interest to get notified when these are available"
          />
        )}
      </AnimatePresence>

      {/* Category Scroll and Products Grid (only show when not searching) */}
      <AnimatePresence>
        {!hasSearchResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Category Scroll */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                Categories
              </h2>
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-2 min-w-max">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={categoryFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter("all")}
                      className="rounded-full"
                    >
                      All
                    </Button>
                  </motion.div>
                  {MOCK_CATEGORIES.map((c) => (
                    <motion.div
                      key={c.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={categoryFilter === c.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(c.id)}
                        className="rounded-full"
                      >
                        {c.name}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {categoryFilter === "all"
                  ? "All Products"
                  : MOCK_CATEGORIES.find((c) => c.id === categoryFilter)?.name}
              </h2>
              {filtered.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filtered.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      quantity={getQty(p.id)}
                      onAdd={() => addItem(p)}
                      onIncrease={() =>
                        updateQuantity(p.id, getQty(p.id) + 1)
                      }
                      onDecrease={() =>
                        updateQuantity(p.id, Math.max(0, getQty(p.id) - 1))
                      }
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No products in this category</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </motion.div>
  );
}
