"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Search, Plus, Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCatalogStore } from "@/store";
import { getCatalogRepository, getDataSourceMode } from "@/lib/repositories";
import { localizeCategoryName, localizeProductName } from "@/lib/localization";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

export default function PMProductsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dataSourceMode = getDataSourceMode();
  const localProducts = useCatalogStore((state) => state.products);
  const localCategories = useCatalogStore((state) => state.categories);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiCategories, setApiCategories] = useState<typeof localCategories>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [upcomingFilter, setUpcomingFilter] = useState<"all" | "upcoming">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionError, setActionError] = useState("");

  const isApiMode = dataSourceMode === "api";
  const products = isApiMode ? apiProducts : localProducts;
  const categories = isApiMode ? apiCategories : localCategories;

  const loadApiData = async () => {
    if (!isApiMode) return;
    try {
      const snapshot = await getCatalogRepository().getSnapshot();
      setApiProducts(snapshot.products);
      setApiCategories(snapshot.categories);
    } catch {
      setActionError("Failed to load products from API mode.");
    }
  };

  useEffect(() => {
    void loadApiData();
  }, [isApiMode]);

  const form = useForm<Product & { upcoming?: boolean }>({
    defaultValues: {} as Product,
  });

  const filtered = useMemo(() => {
    let list = products;
    if (upcomingFilter === "upcoming") list = list.filter((p) => p.upcoming);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          localizeProductName(p.name, locale).toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") list = list.filter((p) => p.categoryId === categoryFilter);
    return list;
  }, [products, search, categoryFilter, upcomingFilter, locale]);

  const openAdd = () => {
    setEditingProduct(null);
    form.reset({
      id: `p${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop",
      categoryId: categories[0]?.id ?? "",
      categoryName: categories[0]?.name ?? "",
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

  const saveProduct = async (data: Product & { upcoming?: boolean }) => {
    const payload = { ...data, upcoming: data.upcoming ?? false };
    let result: { ok: boolean; error?: string } = { ok: true };
    if (editingProduct) {
      result = await getCatalogRepository().updateProduct(payload);
    } else {
      result = await getCatalogRepository().createProduct({ ...payload } as Product);
    }
    if (!result.ok) {
      setActionError(result.error ?? "You do not have permission to modify products.");
      return;
    }
    if (isApiMode) await loadApiData();
    setActionError("");
    setModalOpen(false);
  };

  const getStockBadge = (p: Product) => {
    if (p.upcoming) return <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600">{t("pmProducts.upcoming")}</span>;
    if (p.stock === 0) return <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs text-destructive">{t("pmProducts.outOfStock")}</span>;
    if (p.stock <= 5) return <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600">{t("pmProducts.low")}</span>;
    return <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">{t("pmProducts.inStock")}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("pmProducts.title")}</h1>
          <p className="text-muted-foreground">{t("pmProducts.subtitle")}</p>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-primary to-primary/90">
          <Plus className="mr-2 h-4 w-4" /> {t("pmProducts.addProduct")}
        </Button>
      </div>
      {actionError && <p className="text-sm text-destructive">{actionError}</p>}
      <Card className="glass-card border-white/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("pmProducts.search")} className="pl-11 pr-4 bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white shadow-sm">
                <SelectValue placeholder={t("pmProducts.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("pmProducts.all")}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{localizeCategoryName(c.name, locale)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={upcomingFilter} onValueChange={(v: "all" | "upcoming") => setUpcomingFilter(v)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-white shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("pmProducts.all")}</SelectItem>
                <SelectItem value="upcoming">{t("pmProducts.upcomingOnly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">{t("pmProducts.product")}</th>
                  <th className="text-left p-4 font-medium">{t("pmProducts.category")}</th>
                  <th className="text-left p-4 font-medium">{t("pmProducts.price")}</th>
                  <th className="text-left p-4 font-medium">{t("pmProducts.stock")}</th>
                  <th className="text-right p-4 font-medium">{t("pmProducts.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <p className="font-medium">{localizeProductName(p.name, locale)}</p>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{localizeCategoryName(p.categoryName, locale)}</td>
                    <td className="p-4">{formatPrice(p.price)}</td>
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
            <DialogTitle>{editingProduct ? t("pmProducts.editProduct") : t("pmProducts.addProduct")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(saveProduct)} className="space-y-4">
            <div>
              <Label>{t("pmProducts.name")}</Label>
              <Input {...form.register("name", { required: true })} className="mt-1" />
            </div>
            <div>
              <Label>{t("pmProducts.description")}</Label>
              <Input {...form.register("description")} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("pmProducts.priceInr")}</Label>
                <Input type="number" {...form.register("price", { valueAsNumber: true })} className="mt-1" />
              </div>
              <div>
                <Label>{t("pmProducts.stock")}</Label>
                <Input type="number" {...form.register("stock", { valueAsNumber: true })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>{t("pmProducts.category")}</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(v) => {
                  const cat = categories.find((c) => c.id === v);
                  form.setValue("categoryId", v);
                  if (cat) form.setValue("categoryName", cat.name);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{localizeCategoryName(c.name, locale)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("pmProducts.imageUrlPreview")}</Label>
              <Input {...form.register("image")} className="mt-1" />
              {form.watch("image") && (
                <div className="mt-2 h-24 w-24 rounded-lg border overflow-hidden bg-muted">
                  <img src={form.watch("image")} alt="" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pm-upcoming" {...form.register("upcoming")} className="rounded border" />
              <Label htmlFor="pm-upcoming">{t("pmProducts.upcomingProductNotify")}</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t("pmProducts.cancel")}</Button>
              <Button type="submit">{t("pmProducts.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
