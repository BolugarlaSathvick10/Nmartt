"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Truck, CheckCircle, X } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";
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

const statusSteps = [
  { key: "pending", label: "Order placed", icon: Package },
  { key: "accepted", label: "Accepted", icon: Truck },
  { key: "out_for_delivery", label: "Out for delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function UserOrdersPage() {
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const myOrders = MOCK_ORDERS.filter((o) => o.userId === "u1" || o.userName === "John Doe");
  const trackingOrder = trackingOrderId ? myOrders.find((o) => o.id === trackingOrderId) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">View and track orders</p>
      </div>
      <div className="space-y-4">
        {myOrders.map((o, i) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card border-white/20 hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{o.id}</p>
                    <p className="font-semibold">{formatPrice(o.total)} · {o.items.length} items</p>
                    <p className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setTrackingOrderId(o.id)}>
                      Track
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/user/orders?view=${o.id}`}>Details</Link>
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
              <p>No orders yet.</p>
              <Button asChild className="mt-4">
                <Link href="/user/home">Shop now</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!trackingOrderId} onOpenChange={() => setTrackingOrderId(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Track order {trackingOrderId}</span>
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
                <OrderTimeline status={trackingOrder.status} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const currentIndex = statusSteps.findIndex((s) => s.key === status);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
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
