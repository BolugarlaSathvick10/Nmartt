"use client";

import { motion } from "framer-motion";
import { Package, FolderTree, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const lowStock = MOCK_PRODUCTS.filter((p) => p.stock > 0 && p.stock <= 5);
const outOfStock = MOCK_PRODUCTS.filter((p) => p.stock === 0);

export default function PMDashboardPage() {
  const t = useTranslations();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboards.pm.title")}</h1>
        <p className="text-muted-foreground">{t("dashboards.pm.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboards.pm.totalProducts")}</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{MOCK_PRODUCTS.length}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboards.pm.categories")}</CardTitle>
              <FolderTree className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{MOCK_CATEGORIES.length}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboards.pm.lowOutOfStock")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{lowStock.length + outOfStock.length}</p>
              <p className="text-xs text-muted-foreground">{t("dashboards.pm.lowOut", { low: lowStock.length, out: outOfStock.length })}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboards.pm.lowStockAlerts")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
              {(lowStock.length ? lowStock : outOfStock.slice(0, 5)).map((p) => (
                <li key={p.id} className="flex justify-between rounded-lg border px-4 py-2 text-sm">
                  <span>{p.name}</span>
                  <span className={p.stock === 0 ? "text-destructive font-medium" : "text-amber-600"}>{p.stock} {p.unit}</span>
                </li>
              ))}
              {lowStock.length === 0 && outOfStock.length === 0 && <li className="text-muted-foreground">{t("dashboards.pm.noAlerts")}</li>}
            </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
