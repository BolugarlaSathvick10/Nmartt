"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PMInventoryPage() {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const products = MOCK_PRODUCTS.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    if (filter === "low") return matchSearch && p.stock > 0 && p.stock <= 5;
    if (filter === "out") return matchSearch && p.stock === 0;
    return matchSearch;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("pmInventory.title")}</h1>
        <p className="text-muted-foreground">{t("pmInventory.subtitle")}</p>
      </div>
      <Card className="glass-card border-white/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("pmInventory.searchProducts")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filter} onValueChange={(v: "all" | "low" | "out") => setFilter(v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("pmInventory.all")}</SelectItem>
                <SelectItem value="low">{t("pmInventory.lowStock")}</SelectItem>
                <SelectItem value="out">{t("pmInventory.outOfStock")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">{t("pmInventory.product")}</th>
                  <th className="text-left p-4 font-medium">{t("pmInventory.price")}</th>
                  <th className="text-left p-4 font-medium">{t("pmInventory.stock")}</th>
                  <th className="text-left p-4 font-medium">{t("pmInventory.status")}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          <img src={p.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{formatPrice(p.price)}</td>
                    <td className="p-4">{p.stock} {p.unit}</td>
                    <td className="p-4">
                      {p.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/20 px-2 py-0.5 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3" /> {t("pmInventory.outOfStock")}
                        </span>
                      ) : p.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3" /> {t("pmInventory.low")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">{t("pmInventory.ok")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
