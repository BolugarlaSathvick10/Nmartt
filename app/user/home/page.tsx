"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Plus, Minus, Bell } from "lucide-react";
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
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") list = list.filter((p) => p.categoryId === categoryFilter);
    return list;
  }, [search, categoryFilter]);

  const inCart = (id: string) => items.find((i) => i.product.id === id);
  const getQty = (id: string) => inCart(id)?.quantity ?? 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">N-Mart</h1>
          <p className="text-muted-foreground">Fresh groceries delivered</p>
        </div>
        <Button variant="outline" size="lg" className="relative" onClick={() => setCartOpen(true)}>
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart
          {totalItems() > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {totalItems()}
            </span>
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {MOCK_CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {upcomingProducts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Upcoming products
          </h2>
          <p className="text-sm text-muted-foreground">Show interest to get notified when these are available (like BookMyShow).</p>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-x-auto pb-2">
            {upcomingProducts.map((p, i) => (
              <UpcomingProductCard
                key={p.id}
                product={p}
                isInterested={hasInterest(p.id)}
                interestCount={getCount(p.id)}
                onNotifyMe={() => addInterest(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          <Link href="/user/home">
            <Button variant={categoryFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter("all")}>
              All
            </Button>
          </Link>
          {MOCK_CATEGORIES.map((c) => (
            <Button
              key={c.id}
              variant={categoryFilter === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
          >
            <ProductCard
              product={p}
              quantity={getQty(p.id)}
              onAdd={() => addItem(p)}
              onIncrease={() => updateQuantity(p.id, getQty(p.id) + 1)}
              onDecrease={() => updateQuantity(p.id, getQty(p.id) - 1)}
            />
          </motion.div>
        ))}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </motion.div>
  );
}

function UpcomingProductCard({
  product,
  isInterested,
  interestCount,
  onNotifyMe,
}: {
  product: Product;
  isInterested: boolean;
  interestCount: number;
  onNotifyMe: () => void;
}) {
  return (
    <Card className="glass-card border-amber-500/30 overflow-hidden hover:shadow-lg transition-all">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <span className="absolute top-2 left-2 rounded bg-amber-500/90 px-2 py-0.5 text-xs text-white">Coming soon</span>
      </div>
      <CardContent className="p-3">
        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{product.categoryName}</p>
        <div className="mt-2 space-y-1">
          <Button
            size="sm"
            variant={isInterested ? "secondary" : "default"}
            className="w-full text-xs gap-1"
            onClick={onNotifyMe}
            disabled={isInterested}
          >
            <Bell className="h-3 w-3" />
            {isInterested ? "You'll be notified" : "Notify me"}
          </Button>
          {interestCount > 0 && (
            <p className="text-xs text-muted-foreground text-center">{interestCount} interested</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
}: {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <Card className="glass-card border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {product.originalPrice != null && (
          <span className="absolute top-2 left-2 rounded bg-destructive/90 px-2 py-0.5 text-xs text-white">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% off
          </span>
        )}
      </div>
      <CardContent className="p-4">
        <p className="font-medium line-clamp-2">{product.name}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{product.categoryName}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice != null && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {quantity === 0 ? (
            <Button size="sm" className="bg-gradient-to-r from-primary to-primary/90" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          ) : (
            <div className="flex items-center gap-1 rounded-lg border">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDecrease}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onIncrease}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
