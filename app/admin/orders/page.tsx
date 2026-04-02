"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-600",
  accepted: "bg-blue-500/20 text-blue-600",
  out_for_delivery: "bg-purple-500/20 text-purple-600",
  delivered: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
  rejected: "bg-destructive/20 text-destructive",
};

export default function AdminOrdersPage() {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const orders = MOCK_ORDERS.filter((o) => {
    const matchSearch = !search || o.userName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold">{t("adminOrders.title")}</h1>
          <p className="text-muted-foreground">{t("adminOrders.subtitle")}</p>
        </div>
        <Card className="glass-card border-white/20">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("adminOrders.searchPlaceholder")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t("adminOrders.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("adminOrders.allStatuses")}</SelectItem>
                  <SelectItem value="pending">{t("adminOrders.pending")}</SelectItem>
                  <SelectItem value="accepted">{t("adminOrders.accepted")}</SelectItem>
                  <SelectItem value="out_for_delivery">{t("adminOrders.outForDelivery")}</SelectItem>
                  <SelectItem value="delivered">{t("adminOrders.delivered")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">{t("adminOrders.orderId")}</th>
                    <th className="text-left p-4 font-medium">{t("adminOrders.customer")}</th>
                    <th className="text-left p-4 font-medium">{t("adminOrders.total")}</th>
                    <th className="text-left p-4 font-medium">{t("adminOrders.status")}</th>
                    <th className="text-left p-4 font-medium">{t("adminOrders.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-mono text-sm">{o.id}</td>
                      <td className="p-4">{o.userName}</td>
                      <td className="p-4">{formatPrice(o.total)}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[o.status] ?? ""}`}>
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
