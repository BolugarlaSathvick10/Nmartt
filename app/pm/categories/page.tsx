"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getCatalogRepository, getDataSourceMode } from "@/lib/repositories";
import { useCatalogStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree } from "lucide-react";

export default function PMCategoriesPage() {
  const t = useTranslations();
  const dataSourceMode = getDataSourceMode();
  const localCategories = useCatalogStore((state) => state.categories);
  const [apiCategories, setApiCategories] = useState<typeof localCategories>([]);
  const isApiMode = dataSourceMode === "api";
  const categories = isApiMode ? apiCategories : localCategories;

  useEffect(() => {
    if (!isApiMode) return;
    let active = true;
    const load = async () => {
      try {
        const snapshot = await getCatalogRepository().getSnapshot();
        if (!active) return;
        setApiCategories(snapshot.categories);
      } catch {
        if (!active) return;
        setApiCategories(localCategories);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isApiMode, localCategories]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("pmCategories.title")}</h1>
        <p className="text-muted-foreground">{t("pmCategories.subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="glass-card border-white/20 hover:shadow-lg transition-all">
              <CardHeader>
                <FolderTree className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{c.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t("pmCategories.productsCount", { count: c.productCount })}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
