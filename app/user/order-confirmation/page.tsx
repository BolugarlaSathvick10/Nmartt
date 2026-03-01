"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "N/A";
  const address = searchParams.get("address") ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full min-h-screen flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-md w-full text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="inline-flex rounded-full bg-primary/20 p-4"
      >
        <CheckCircle className="h-16 w-16 text-primary" />
      </motion.div>
      <div>
        <h1 className="text-2xl font-bold">Order placed!</h1>
        <p className="text-muted-foreground mt-1">Thank you for your order.</p>
      </div>
      <Card className="glass-card border-white/20 text-left">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Order ID</p>
          <p className="font-mono font-semibold">{orderId}</p>
          {address && (
            <>
              <p className="text-sm text-muted-foreground mt-4">Delivery to</p>
              <p>{decodeURIComponent(address)}</p>
            </>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="bg-gradient-to-r from-primary to-primary/90">
          <Link href="/user/orders">Track order</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/user/home">Continue shopping</Link>
        </Button>
      </div>
      </div>
    </motion.div>
  );
}
