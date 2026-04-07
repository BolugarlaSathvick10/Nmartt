"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, X, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getDataSourceMode, getOrderRepository } from "@/lib/repositories";
import { useAuthStore, useOrderStore } from "@/store";
import { localizeProductName } from "@/lib/localization";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeliveryMapClient } from "@/components/delivery-map-client";
import { getMockUserLocation } from "@/lib/locations";

const statusFlow: OrderStatus[] = ["accepted", "out_for_delivery", "delivered"];

export default function DeliveryOrdersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const dataSourceMode = getDataSourceMode();
  const user = useAuthStore((s) => s.user);
  const localOrders = useOrderStore((s) => s.orders);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const [apiOrders, setApiOrders] = useState<typeof localOrders>([]);
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
    }, 3000);

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

  const orders = allOrders.filter(
    (o) =>
      o.status !== "cancelled" &&
      o.status !== "rejected" &&
      (o.deliveryBoyName === user?.name || o.status === "pending")
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (isApiMode) {
      const result = await getOrderRepository().updateOrderStatus(orderId, newStatus);
      if (result.ok) {
        const rows = await getOrderRepository().getOrders();
        setApiOrders(rows);
      }
    } else {
      updateOrderStatus(orderId, newStatus);
    }
    if (selectedOrder?.id === orderId) setSelectedOrder((o) => (o ? { ...o, status: newStatus } : null));
  };

  const acceptOrder = (orderId: string) => void updateStatus(orderId, "accepted");
  const rejectOrder = async (orderId: string) => {
    await updateStatus(orderId, "rejected");
    setDetailOpen(false);
  };

  const nextStatus = (current: OrderStatus): OrderStatus | null => {
    const i = statusFlow.indexOf(current);
    return i < statusFlow.length - 1 ? statusFlow[i + 1]! : null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("deliveryOrders.title")}</h1>
        <p className="text-muted-foreground">{t("deliveryOrders.subtitle")}</p>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {orders.map((o) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-card border-white/20 hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">{o.id}</p>
                      <p className="font-semibold">{o.userName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {o.userAddress}
                      </p>
                      <p className="text-sm font-medium mt-2">{formatPrice(o.total)} · {t("deliveryOrders.itemsCount", { count: o.items.length })}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{t(`orderStatus.${o.status}`)}</span>
                      {o.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => void acceptOrder(o.id)}>
                            <Check className="mr-1 h-4 w-4" /> {t("deliveryOrders.accept")}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => void rejectOrder(o.id)}>
                            <X className="mr-1 h-4 w-4" /> {t("deliveryOrders.reject")}
                          </Button>
                        </>
                      )}
                      {o.status !== "pending" && o.status !== "delivered" && nextStatus(o.status) && (
                        <Button size="sm" onClick={() => void updateStatus(o.id, nextStatus(o.status)!)}>
                          <Truck className="mr-1 h-4 w-4" /> {o.status === "accepted" ? t("deliveryOrders.outForDelivery") : t("deliveryOrders.markDelivered")}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => { setSelectedOrder(o); setDetailOpen(true); }}>
                        {t("deliveryOrders.details")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("deliveryOrders.order", { id: selectedOrder?.id ?? "" })}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{t("deliveryOrders.customer")}</p>
                <p>{selectedOrder.userName} · {selectedOrder.userMobile}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedOrder.userAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("deliveryOrders.items")}</p>
                <ul className="mt-1 space-y-1">
                  {selectedOrder.items.map((item) => (
                    <li key={item.productId} className="flex justify-between text-sm">
                      <span>{localizeProductName(item.productName, locale)} × {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold mt-2">{t("deliveryOrders.total")} {formatPrice(selectedOrder.total)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{t("deliveryOrders.route")}</p>
                <DeliveryMapClient
                  userLocation={getMockUserLocation(selectedOrder.userAddress)}
                  showRoute={true}
                  height="240px"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
