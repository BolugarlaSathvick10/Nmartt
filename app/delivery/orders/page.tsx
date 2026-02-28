"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Package, Check, X, Truck } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [orders, setOrders] = useState(
    MOCK_ORDERS.filter((o) => o.deliveryBoyName && o.status !== "cancelled" && o.status !== "rejected")
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, deliveredAt: newStatus === "delivered" ? new Date().toISOString() : o.deliveredAt } : o))
    );
    if (selectedOrder?.id === orderId) setSelectedOrder((o) => (o ? { ...o, status: newStatus } : null));
  };

  const acceptOrder = (orderId: string) => updateStatus(orderId, "accepted");
  const rejectOrder = (orderId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "rejected" as OrderStatus } : o)).filter((o) => o.status !== "rejected"));
    setDetailOpen(false);
  };

  const nextStatus = (current: OrderStatus): OrderStatus | null => {
    const i = statusFlow.indexOf(current);
    return i < statusFlow.length - 1 ? statusFlow[i + 1]! : null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assigned Orders</h1>
        <p className="text-muted-foreground">Accept, reject, and update delivery status</p>
      </div>
      <div className="space-y-4">
        <AnimatePresence>
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.05 }}
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
                      <p className="text-sm font-medium mt-2">{formatPrice(o.total)} · {o.items.length} items</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{o.status.replace(/_/g, " ")}</span>
                      {o.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => acceptOrder(o.id)}>
                            <Check className="mr-1 h-4 w-4" /> Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectOrder(o.id)}>
                            <X className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </>
                      )}
                      {o.status !== "pending" && o.status !== "delivered" && nextStatus(o.status) && (
                        <Button size="sm" onClick={() => updateStatus(o.id, nextStatus(o.status)!)}>
                          <Truck className="mr-1 h-4 w-4" /> {o.status === "accepted" ? "Out for delivery" : "Mark delivered"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => { setSelectedOrder(o); setDetailOpen(true); }}>
                        Details
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
            <DialogTitle>Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Customer</p>
                <p>{selectedOrder.userName} · {selectedOrder.userMobile}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedOrder.userAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Items</p>
                <ul className="mt-1 space-y-1">
                  {selectedOrder.items.map((item) => (
                    <li key={item.productId} className="flex justify-between text-sm">
                      <span>{item.productName} × {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-semibold mt-2">Total: {formatPrice(selectedOrder.total)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Route: Shop → Delivery</p>
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
