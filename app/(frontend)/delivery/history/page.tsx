"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { getDataSourceMode, getOrderRepository } from "@/lib/repositories";
import { useAuthStore, useOrderStore } from "@/store";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeliveryHistoryPage() {
  const t = useTranslations();
  const dataSourceMode = getDataSourceMode();
  const user = useAuthStore((s) => s.user);
  const localOrders = useOrderStore((s) => s.orders);
  const [apiOrders, setApiOrders] = useState<typeof localOrders>([]);
  const isApiMode = dataSourceMode === "api";
  const orders = isApiMode ? apiOrders : localOrders;

  useEffect(() => {
    if (!isApiMode) return;
    let active = true;
    const load = async () => {
      try {
        const rows = await getOrderRepository().getOrders();
        if (!active) return;
        setApiOrders(rows);
      } catch {}
    };

    void load();

    const intervalId = window.setInterval(() => {
      void load();
    }, 4000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isApiMode]);

  const delivered = orders.filter((o) => o.status === "delivered" && o.deliveryBoyName === user?.name);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("deliveryHistory.title")}</h1>
        <p className="text-muted-foreground">{t("deliveryHistory.subtitle")}</p>
      </div>
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> {t("deliveryHistory.deliveredOrders")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {delivered.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col gap-2 rounded-lg border p-4 hover:bg-muted/30"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{o.id}</p>
                    <p className="font-semibold">{o.userName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {o.userAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(o.total)}</p>
                    {o.deliveredAt && <p className="text-xs text-muted-foreground">{formatDate(o.deliveredAt)}</p>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{t("deliveryHistory.itemsCount", { count: o.items.length })}</p>
              </motion.div>
            ))}
            {delivered.length === 0 && <p className="text-muted-foreground text-center py-8">{t("deliveryHistory.noHistory")}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
