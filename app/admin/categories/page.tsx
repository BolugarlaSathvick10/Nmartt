"use client";

import { motion } from "framer-motion";
import { FolderTree } from "lucide-react";
import { useTranslations } from "next-intl";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/BackButton";

export default function AdminCategoriesPage() {
  const t = useTranslations();

  return (
    <div className="w-full flex flex-col gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2">
              <BackButton />
            </div>
            <h1 className="text-2xl font-bold">{t("adminCategories.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("adminCategories.subtitle")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
          {MOCK_CATEGORIES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-white/20 hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <FolderTree className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t("adminCategories.productsCount", { count: c.productCount })}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
