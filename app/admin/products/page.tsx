"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCatalogStore } from "@/store";
import { getCatalogRepository, getDataSourceMode } from "@/lib/repositories";
import { localizeCategoryName, localizeProductName } from "@/lib/localization";
import { parseQuantityPricing, serializeQuantityPricing } from "@/lib/product-units";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductForm = Product & { upcoming?: boolean };
type QuantityPriceRow = { id: string; label: string; price: number };

function makeQuantityPriceRow(label: string, price: number): QuantityPriceRow {
  return {
    id: `qp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    price,
  };
}

export default function AdminProductsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dataSourceMode = getDataSourceMode();
  const localProducts = useCatalogStore((state) => state.products);
  const localCategories = useCatalogStore((state) => state.categories);
  const localProductActivities = useCatalogStore((state) => state.productActivities);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiCategories, setApiCategories] = useState<typeof localCategories>([]);
  const [apiProductActivities, setApiProductActivities] = useState<typeof localProductActivities>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [upcomingFilter, setUpcomingFilter] = useState<"all" | "upcoming">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionError, setActionError] = useState("");
  const [pricingRows, setPricingRows] = useState<QuantityPriceRow[]>([makeQuantityPriceRow("1 kg", 0)]);
  const [pricingError, setPricingError] = useState("");

  const isApiMode = dataSourceMode === "api";
  const products = isApiMode ? apiProducts : localProducts;
  const categories = isApiMode ? apiCategories : localCategories;
  const productActivities = isApiMode ? apiProductActivities : localProductActivities;

  const loadApiData = async () => {
    if (!isApiMode) return;
    try {
      const [snapshot, activities] = await Promise.all([
        getCatalogRepository().getSnapshot(),
        getCatalogRepository().getProductActivities(100),
      ]);
      setApiProducts(snapshot.products);
      setApiCategories(snapshot.categories);
      setApiProductActivities(activities);
    } catch {
      setActionError("Failed to load products from API mode.");
    }
  };

  useEffect(() => {
    void loadApiData();
  }, [isApiMode]);

  useEffect(() => {
    if (!modalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleModalOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  const form = useForm<ProductForm>({
    defaultValues: {
      id: "",
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: categories[0]?.id ?? "",
      categoryName: "",
      stock: 0,
      unit: "1 kg@0",
      createdAt: new Date().toISOString(),
      upcoming: false,
    },
  });

  const filtered = useMemo(() => {
    let list = products;
    if (upcomingFilter === "upcoming") list = list.filter((p) => p.upcoming);
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
    if (categoryFilter !== "all") list = list.filter((p) => p.categoryId === categoryFilter);
    return list;
  }, [products, search, categoryFilter, upcomingFilter, locale]);

  const openAdd = () => {
    setEditingProduct(null);
    setPricingRows([makeQuantityPriceRow("1 kg", 0)]);
    setPricingError("");
    form.reset({
      id: `p${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: categories[0]?.id ?? "",
      categoryName: categories[0]?.name ?? "",
      stock: 0,
      unit: "1 kg@0",
      createdAt: new Date().toISOString(),
      upcoming: false,
    });
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setPricingRows(
      parseQuantityPricing(product.unit, product.price).map((option) => makeQuantityPriceRow(option.label, option.price))
    );
    setPricingError("");
    form.reset({ ...product, upcoming: product.upcoming ?? false });
    setModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingProduct(null);
      setPricingError("");
    }
  };

  const saveProduct = async (data: ProductForm) => {
    const normalizedPricing = pricingRows
      .map((row) => ({
        label: row.label.trim(),
        price: Number.isFinite(row.price) ? Math.max(0, Math.round(row.price)) : 0,
      }))
      .filter((row) => row.label.length > 0);

    if (normalizedPricing.length === 0) {
      setPricingError("Please add at least one quantity with price.");
      return;
    }

    const payload: Product = {
      ...data,
      price: normalizedPricing[0].price,
      unit: serializeQuantityPricing(normalizedPricing),
      upcoming: data.upcoming ?? false,
    };

    let result: { ok: boolean; error?: string } = { ok: true };
    if (editingProduct) {
      result = await getCatalogRepository().updateProduct(payload);
    } else {
      result = await getCatalogRepository().createProduct(payload);
    }
    if (!result.ok) {
      setActionError(result.error ?? "You do not have permission to update products.");
      return;
    }
    if (isApiMode) await loadApiData();
    setActionError("");
    setPricingError("");
    setModalOpen(false);
  };

  const addPricingRow = () => {
    setPricingRows((prev) => [...prev, makeQuantityPriceRow("", 0)]);
  };

  const removePricingRow = (rowId: string) => {
    setPricingRows((prev) => {
      const next = prev.filter((row) => row.id !== rowId);
      return next.length > 0 ? next : [makeQuantityPriceRow("", 0)];
    });
  };

  const updatePricingRow = (rowId: string, patch: Partial<Omit<QuantityPriceRow, "id">>) => {
    setPricingRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              ...patch,
            }
          : row
      )
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this product?")) {
      const result = await getCatalogRepository().deleteProduct(id);
      if (!result.ok) {
        setActionError(result.error ?? "Only admin can delete products.");
        return;
      }
      if (isApiMode) await loadApiData();
      setActionError("");
    }
  };

  const getStockBadge = (p: Product) => {
    if (p.upcoming) return <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600">{t("adminProducts.upcoming")}</span>;
    if (p.stock === 0) return <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs text-destructive">{t("adminProducts.outOfStock")}</span>;
    if (p.stock <= 5) return <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600">{t("adminProducts.low")}</span>;
    return <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">{t("adminProducts.inStock")}</span>;
  };

  const formatActivityAction = (action: string) => {
    if (action === "create") return "Created";
    if (action === "update") return "Updated";
    if (action === "update_price") return "Price Updated";
    if (action === "delete") return "Deleted";
    return action;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{t("adminProducts.title")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("adminProducts.subtitle")}</p>
          </div>
          <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> {t("adminProducts.addProduct")}
          </Button>
        </div>
        {actionError && <p className="text-sm text-destructive">{actionError}</p>}

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 min-w-[200px] w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("adminProducts.searchProducts")}
              className="pl-11 border border-gray-200 rounded-lg pr-4 py-2 focus:ring-2 focus:ring-green-500 w-full bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px] border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm">
              <SelectValue placeholder={t("adminProducts.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("adminProducts.allCategories")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{localizeCategoryName(c.name, locale)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={upcomingFilter} onValueChange={(value) => setUpcomingFilter(value as "all" | "upcoming")}>
            <SelectTrigger className="w-full md:w-[160px] border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm">
              <SelectValue placeholder={t("adminProducts.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("adminProducts.allProducts")}</SelectItem>
              <SelectItem value="upcoming">{t("adminProducts.upcomingOnly")}</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-0">
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-900">{t("adminProducts.product")}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t("adminProducts.category")}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t("adminProducts.price")}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t("adminProducts.stock")}</th>
                    <th className="text-right p-4 font-medium text-gray-900">{t("adminProducts.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            <img src={p.image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{localizeProductName(p.name, locale)}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{localizeCategoryName(p.categoryName, locale)}</td>
                      <td className="p-4">
                        {(() => {
                          const quantityPricing = parseQuantityPricing(p.unit, p.price);
                          const startPrice = quantityPricing[0]?.price ?? p.price;
                          return (
                            <div>
                              <p className="font-medium text-gray-900">{formatPrice(startPrice)}</p>
                              {quantityPricing.length > 1 && (
                                <p className="text-xs text-muted-foreground">+{quantityPricing.length - 1} more sizes</p>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-4">{getStockBadge(p)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => void handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-5 space-y-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Recent Product Activity</h2>
              <p className="text-sm text-gray-500">Latest product create, update, price, and delete actions</p>
            </div>
            <div className="space-y-2 max-h-72 overflow-auto">
              {productActivities.slice(0, 12).map((activity) => (
                <div key={activity.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                  <p className="font-medium text-gray-900">
                    {formatActivityAction(activity.action)}: {localizeProductName(activity.productName, locale)}
                  </p>
                  <p className="text-gray-500">
                    By {activity.actorName ?? "Unknown"} ({activity.actorRole ?? "unknown"}) at {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  {activity.action === "update_price" && (
                    <p className="text-gray-500">
                      Price: {activity.oldPrice ?? 0} {"->"} {activity.newPrice ?? 0}
                    </p>
                  )}
                </div>
              ))}
              {productActivities.length === 0 && (
                <p className="text-sm text-gray-500">No product activity yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal backdrop"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => handleModalOpenChange(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-[71] w-[95vw] rounded-2xl border border-emerald-100 bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? t("adminProducts.editProduct") : t("adminProducts.addProduct")}
              </h2>
              <Button type="button" variant="ghost" size="icon" onClick={() => handleModalOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={form.handleSubmit(saveProduct)} className="max-h-[76vh] space-y-4 overflow-y-auto pr-1">
              <div>
                <Label>{t("adminProducts.name")}</Label>
                <Input {...form.register("name", { required: true })} className="mt-1" />
              </div>
              <div>
                <Label>{t("adminProducts.description")}</Label>
                <Input {...form.register("description")} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("adminProducts.stock")}</Label>
                  <Input type="number" {...form.register("stock", { valueAsNumber: true })} className="mt-1" />
                </div>
                <div>
                  <Label>{t("adminProducts.category")}</Label>
                  <Select
                    value={form.watch("categoryId")}
                    onValueChange={(value) => {
                      const category = categories.find((c) => c.id === value);
                      form.setValue("categoryId", value);
                      if (category) form.setValue("categoryName", category.name);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" className="z-[120] w-[var(--radix-select-trigger-width)] rounded-xl border border-emerald-100 bg-white shadow-xl">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{localizeCategoryName(c.name, locale)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Quantity and custom price</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addPricingRow}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add option
                  </Button>
                </div>
                <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                  {pricingRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-12 gap-2">
                      <div className="col-span-7">
                        <Input
                          value={row.label}
                          placeholder="e.g. 1 kg, 500 g, 25 g"
                          onChange={(e) => updatePricingRow(row.id, { label: e.target.value })}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          type="number"
                          min={0}
                          value={row.price}
                          placeholder="Price"
                          onChange={(e) => updatePricingRow(row.id, { price: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removePricingRow(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {pricingError && <p className="mt-1 text-xs text-destructive">{pricingError}</p>}
              </div>
              <div>
                <Label>{t("adminProducts.imageUrlPreview")}</Label>
                <Input {...form.register("image")} className="mt-1" />
                {form.watch("image") && (
                  <div className="mt-2 h-24 w-24 rounded-lg border overflow-hidden bg-muted">
                    <img src={form.watch("image")} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="upcoming" {...form.register("upcoming")} className="rounded border" />
                <Label htmlFor="upcoming">{t("adminProducts.upcomingProductNotify")}</Label>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => handleModalOpenChange(false)}>{t("adminProducts.cancel")}</Button>
                <Button type="submit">{t("adminProducts.save")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
