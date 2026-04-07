"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Truck, CheckCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getDataSourceMode, getOrderRepository } from "@/lib/repositories";
import { useAuthStore, useOrderStore } from "@/store";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderTrackingMapClient } from "@/components/order-tracking-map-client";

export default function UserOrdersPage() {
  const t = useTranslations();
  const dataSourceMode = getDataSourceMode();
  const user = useAuthStore((s) => s.user);
  const localOrders = useOrderStore((s) => s.orders);
  const [apiOrders, setApiOrders] = useState<typeof localOrders>([]);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const isApiMode = dataSourceMode === "api";
  const allOrders = isApiMode ? apiOrders : localOrders;

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

  const myOrders = allOrders.filter((o) => o.userId === user?.id);
  const trackingOrder = trackingOrderId ? myOrders.find((o) => o.id === trackingOrderId) : null;

  const statusSteps = [
    { key: "pending", label: t("orders.orderPlaced"), icon: Package },
    { key: "accepted", label: t("orders.accepted"), icon: Truck },
    { key: "out_for_delivery", label: t("orders.outForDelivery"), icon: Truck },
    { key: "delivered", label: t("orders.delivered"), icon: CheckCircle },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("orders.title")}</h1>
        <p className="text-muted-foreground">{t("orders.subtitle")}</p>
      </div>
      <div className="space-y-4">
        {myOrders.map((o) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card className="glass-card border-white/20 hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{o.id}</p>
                    <p className="font-semibold">{formatPrice(o.total)} · {t("orders.itemsCount", { count: o.items.length })}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setTrackingOrderId(o.id)}>
                      {t("orders.track")}
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/user/orders?view=${o.id}`}>{t("orders.details")}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {myOrders.length === 0 && (
          <Card className="glass-card border-white/20">
            <CardContent className="py-12 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("orders.noOrders")}</p>
              <Button asChild className="mt-4">
                <Link href="/user/home">{t("orders.shopNow")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!trackingOrderId} onOpenChange={() => setTrackingOrderId(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>{t("orders.trackOrder", { id: trackingOrderId ?? "" })}</span>
              <Button variant="ghost" size="icon" onClick={() => setTrackingOrderId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {trackingOrder && (
            <>
              <div className="px-4 pt-2">
                <OrderTrackingMapClient
                  orderId={trackingOrder.id}
                  userAddress={trackingOrder.userAddress}
                  status={trackingOrder.status}
                  height="280px"
                />
              </div>
              <div className="p-4 border-t">
                <OrderTimeline status={trackingOrder.status} statusSteps={statusSteps} statusTitle={t("orders.status")} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function OrderTimeline({
  status,
  statusSteps,
  statusTitle,
}: {
  status: string;
  statusSteps: Array<{ key: string; label: string; icon: ComponentType<{ className?: string }> }>;
  statusTitle: string;
}) {
  const currentIndex = statusSteps.findIndex((s) => s.key === status);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground mb-2">{statusTitle}</p>
      {statusSteps.map((step, i) => {
        const isActive = i <= activeIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex gap-3 items-center">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                isActive ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
