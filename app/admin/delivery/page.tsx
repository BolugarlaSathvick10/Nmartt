"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Truck, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getAuthRepository, getDataSourceMode, getOrderRepository } from "@/lib/repositories";
import { useAuthStore, useOrderStore } from "@/store";
import type { Order, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminDeliveryPage() {
  const t = useTranslations();
  const dataSourceMode = getDataSourceMode();
  const localUsers = useAuthStore((state) => state.users);
  const localOrders = useOrderStore((state) => state.orders);
  const [apiUsers, setApiUsers] = useState<User[]>([]);
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<User | null>(null);

  const isApiMode = dataSourceMode === "api";
  const users = isApiMode ? apiUsers : localUsers;
  const orders = isApiMode ? apiOrders : localOrders;

  useEffect(() => {
    if (!isApiMode) return;

    let active = true;
    const load = async () => {
      try {
        const [usersRows, orderRows] = await Promise.all([
          getAuthRepository().getUsers(),
          getOrderRepository().getOrders(),
        ]);
        if (!active) return;
        setApiUsers(usersRows);
        setApiOrders(orderRows);
      } catch {
        if (!active) return;
        setApiUsers(localUsers);
        setApiOrders(localOrders);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [isApiMode, localUsers, localOrders]);

  const deliveryBoys = useMemo(
    () => users.filter((user) => user.role === "delivery"),
    [users]
  );

  const getDeliveryStats = (deliveryBoy: User) => {
    const activeOrders = orders.filter(
      (order) =>
        (order.deliveryBoyId === deliveryBoy.id || order.deliveryBoyName === deliveryBoy.name) &&
        order.status !== "delivered" &&
        order.status !== "cancelled"
    ).length;

    const totalDeliveries = orders.filter(
      (order) =>
        (order.deliveryBoyId === deliveryBoy.id || order.deliveryBoyName === deliveryBoy.name) &&
        order.status === "delivered"
    ).length;

    return { activeOrders, totalDeliveries };
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold">{t("adminDelivery.title")}</h1>
          <p className="text-muted-foreground">{t("adminDelivery.subtitle")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 min-w-0">
          {deliveryBoys.map((deliveryBoy, i) => {
            const stats = getDeliveryStats(deliveryBoy);
            return (
            <motion.div key={deliveryBoy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card border-white/20 hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center gap-4 cursor-pointer" onClick={() => setSelectedDeliveryBoy(deliveryBoy)}>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{deliveryBoy.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{deliveryBoy.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{deliveryBoy.mobile || "No mobile"}</p>
                  </div>
                  <Truck className="h-8 w-8 text-primary ml-auto" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("adminDelivery.activeOrders")}</p>
                      <p className="font-semibold">{stats.activeOrders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("adminDelivery.totalDeliveries")}</p>
                      <p className="font-semibold">{stats.totalDeliveries}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            );
          })}
          {deliveryBoys.length === 0 && (
            <Card className="glass-card border-white/20 md:col-span-2">
              <CardContent className="py-8 text-center text-muted-foreground">
                No delivery boy accounts found. Create a delivery account from Users module.
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {selectedDeliveryBoy && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delivery details"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setSelectedDeliveryBoy(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-[81] w-[95vw] max-h-[88vh] overflow-y-auto rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl sm:max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Delivery Boy Details</h2>
              <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedDeliveryBoy(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Name" value={selectedDeliveryBoy.name} />
              <Info label="Email" value={selectedDeliveryBoy.email} />
              <Info label="Mobile" value={selectedDeliveryBoy.mobile || "Not provided"} />
              <Info label="Vehicle Number" value={selectedDeliveryBoy.vehicleNumber || "Not provided"} />
              <Info label="Aadhaar Number" value={selectedDeliveryBoy.aadhaarNumber || "Not provided"} />
              <Info label="Driving License Number" value={selectedDeliveryBoy.drivingLicenseNumber || "Not provided"} />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <DocumentPreview title="Aadhaar Image" imageUrl={selectedDeliveryBoy.aadhaarImage} />
              <DocumentPreview title="Driving License Image" imageUrl={selectedDeliveryBoy.drivingLicenseImage} />
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-gray-900">Address</p>
              <p className="mt-1 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-muted-foreground">
                {selectedDeliveryBoy.address || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-gray-900">{value}</p>
    </div>
  );
}

function DocumentPreview({ title, imageUrl }: { title: string; imageUrl?: string }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {imageUrl ? (
        <div className="mt-2 h-44 overflow-hidden rounded-md border bg-muted">
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Not uploaded</p>
      )}
    </div>
  );
}
