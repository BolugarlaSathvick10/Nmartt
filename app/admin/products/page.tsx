"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Search, Plus, Pencil, Trash2, Package } from "lucide-react";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const productList = [...MOCK_PRODUCTS];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(productList);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [upcomingFilter, setUpcomingFilter] = useState<"all" | "upcoming">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inlinePrice, setInlinePrice] = useState<Record<string, number>>({});

  const form = useForm<Product & { imageFile?: FileList; upcoming?: boolean }>({
    defaultValues: {
      id: "",
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: "",
      categoryName: "",
      stock: 0,
      unit: "kg",
      createdAt: new Date().toISOString(),
      upcoming: false,
    },
  });

  const filtered = useMemo(() => {
    let list = products;
    if (upcomingFilter === "upcoming") list = list.filter((p) => p.upcoming);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") list = list.filter((p) => p.categoryId === categoryFilter);
    return list;
  }, [products, search, categoryFilter, upcomingFilter]);

  const openAdd = () => {
    setEditingProduct(null);
    form.reset({
      id: `p${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop",
      categoryId: MOCK_CATEGORIES[0]?.id ?? "",
      categoryName: MOCK_CATEGORIES[0]?.name ?? "",
      stock: 0,
      unit: "kg",
      createdAt: new Date().toISOString(),
      upcoming: false,
    });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    form.reset({ ...p, upcoming: p.upcoming ?? false });
    setModalOpen(true);
  };

  const saveProduct = (data: Product & { upcoming?: boolean }) => {
    const payload = { ...data, upcoming: data.upcoming ?? false };
    if (editingProduct) {
      setProducts((prev) => prev.map((x) => (x.id === data.id ? payload : x)));
    } else {
      setProducts((prev) => [{ ...payload } as Product, ...prev]);
    }
    setModalOpen(false);
  };

  const updatePrice = (id: string, price: number) => {
    setInlinePrice((prev) => ({ ...prev, [id]: price }));
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price } : p)));
  };

  const getStockBadge = (p: Product) => {
    if (p.upcoming) return <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">Upcoming</span>;
    if (p.stock === 0) return <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs text-destructive">Out of stock</span>;
    if (p.stock <= 5) return <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">Low</span>;
    return <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">In stock</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-primary to-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card className="glass-card border-white/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
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
            <Select value={upcomingFilter} onValueChange={(v: "all" | "upcoming") => setUpcomingFilter(v)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="upcoming">Upcoming only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{p.categoryName}</td>
                    <td className="p-4">
                      <input
                        type="number"
                        className="w-20 rounded border bg-background px-2 py-1 text-sm"
                        value={inlinePrice[p.id] ?? p.price}
                        onChange={(e) => updatePrice(p.id, Number(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-4">{getStockBadge(p)}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(saveProduct)} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input {...form.register("name", { required: true })} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Input {...form.register("description")} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹)</Label>
                <Input type="number" {...form.register("price", { valueAsNumber: true })} className="mt-1" />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" {...form.register("stock", { valueAsNumber: true })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(v) => {
                  const cat = MOCK_CATEGORIES.find((c) => c.id === v);
                  form.setValue("categoryId", v);
                  if (cat) form.setValue("categoryName", cat.name);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image URL (preview only)</Label>
              <Input {...form.register("image")} className="mt-1" />
              {form.watch("image") && (
                <div className="mt-2 h-24 w-24 rounded-lg border overflow-hidden bg-muted">
                  <img src={form.watch("image")} alt="" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="upcoming" {...form.register("upcoming")} className="rounded border" />
              <Label htmlFor="upcoming">Upcoming product (users can show interest / Notify me)</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
