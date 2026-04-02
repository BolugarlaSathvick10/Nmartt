"use client";

import { motion } from "framer-motion";
import { ClipboardList, IndianRupee, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const assignedOrders = MOCK_ORDERS.filter((o) => o.status !== "delivered" && o.status !== "cancelled" && o.deliveryBoyName);
const deliveredCount = MOCK_ORDERS.filter((o) => o.status === "delivered").length;
const mockEarnings = 12500;

export default function DeliveryDashboardPage() {
  const t = useTranslations();

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
