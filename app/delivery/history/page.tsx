"use client";

import { motion } from "framer-motion";
import { History, MapPin } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const delivered = MOCK_ORDERS.filter((o) => o.status === "delivered");

export default function DeliveryHistoryPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery History</h1>
        <p className="text-muted-foreground">Past delivered orders</p>
      </div>
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Delivered orders
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
                <p className="text-sm text-muted-foreground">{o.items.length} items</p>
              </motion.div>
            ))}
            {delivered.length === 0 && <p className="text-muted-foreground text-center py-8">No delivery history yet.</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
