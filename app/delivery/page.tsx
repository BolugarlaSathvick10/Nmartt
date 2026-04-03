"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, IndianRupee, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { getDataSourceMode, getOrderRepository } from "@/lib/repositories";
import { useAuthStore, useOrderStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const mockEarnings = 12500;

export default function DeliveryDashboardPage() {
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

  const assignedOrders = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled" && (o.deliveryBoyName === user?.name || o.status === "pending")
  );
  const deliveredCount = orders.filter((o) => o.status === "delivered" && o.deliveryBoyName === user?.name).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboards.delivery.title")}</h1>
        <p className="text-muted-foreground">{t("dashboards.delivery.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboards.delivery.assignedOrders")}</CardTitle>
              <ClipboardList className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{assignedOrders.length}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboards.delivery.totalDeliveries")}</CardTitle>
              <Truck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{deliveredCount}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboards.delivery.earningsMock")}</CardTitle>
              <IndianRupee className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatPrice(mockEarnings)}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboards.delivery.quickLinks")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("dashboards.delivery.quickLinksDesc")}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
