"use client";

import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { MOCK_DELIVERY_BOYS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminDeliveryPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery Boys</h1>
        <p className="text-muted-foreground">Manage delivery personnel</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_DELIVERY_BOYS.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-white/20 hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{d.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{d.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{d.mobile}</p>
                </div>
                <Truck className="h-8 w-8 text-primary ml-auto" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Active orders</p>
                    <p className="font-semibold">{d.activeOrders}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total deliveries</p>
                    <p className="font-semibold">{d.totalDeliveries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
