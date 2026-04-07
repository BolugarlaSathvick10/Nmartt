"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderTree, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { getCatalogRepository, getDataSourceMode } from "@/lib/repositories";
import { useCatalogStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/BackButton";

export default function AdminCategoriesPage() {
  const t = useTranslations();
  const dataSourceMode = getDataSourceMode();
  const localCategories = useCatalogStore((state) => state.categories);
  const [apiCategories, setApiCategories] = useState<typeof localCategories>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
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

  const refreshCategories = async () => {
    const snapshot = await getCatalogRepository().getSnapshot();
    setApiCategories(snapshot.categories);
  };

  const handleCreateCategory = async () => {
    setActionError("");
    setActionSuccess("");
    if (!name.trim()) {
      setActionError("Category name is required.");
      return;
    }

    setSaving(true);
    const result = await getCatalogRepository().createCategory({ name: name.trim(), image: image.trim() || undefined });
    setSaving(false);

    if (!result.ok) {
      setActionError(result.error ?? "Failed to create category.");
      return;
    }

    setActionSuccess(`Category \"${name.trim()}\" created successfully.`);
    setName("");
    setImage("");
    if (isApiMode) {
      await refreshCategories();
    }
  };

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
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" /> Add Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="Dry Fruits" />
            </div>
            <div>
              <Label htmlFor="category-image">Image URL (optional)</Label>
              <Input id="category-image" value={image} onChange={(e) => setImage(e.target.value)} className="mt-1" placeholder="https://..." />
            </div>
            {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            {actionSuccess && <p className="text-sm text-primary">{actionSuccess}</p>}
            <Button onClick={() => void handleCreateCategory()} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
              {saving ? "Saving..." : "Create Category"}
            </Button>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-0">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
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
