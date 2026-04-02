"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const t = useTranslations();

  return (
    <div className="w-full flex flex-col gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold">{t("adminSettings.title")}</h1>
          <p className="text-muted-foreground">{t("adminSettings.subtitle")}</p>
        </div>
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> {t("adminSettings.appearance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label>{t("adminSettings.theme")}</Label>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>{t("adminSettings.storeDetails")}</CardTitle>
            <CardContent className="space-y-4 pt-4">
              <div>
                <Label>{t("adminSettings.storeName")}</Label>
                <input className="mt-1 h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm" defaultValue="N-Mart" readOnly />
              </div>
              <Button variant="outline" disabled>{t("adminSettings.saveMock")}</Button>
            </CardContent>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
}
