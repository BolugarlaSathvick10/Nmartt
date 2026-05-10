"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Landmark, Smartphone } from "lucide-react";
import { getDataSourceMode, getOrderRepository } from "@/lib/repositories";
import { useAuthStore, useCartStore, useOrderStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/BackButton";

type PaymentMethod = "paytm" | "phonepe" | "gpay" | "cod" | "upi_scanner";

type PendingCheckout = {
  address: string;
  mobile: string;
  pincode: string;
  instructions: string;
  couponDiscountRate: number;
  createdAt: number;
};

const UPI_QR_IMAGE_PATH = "/upi-scanner.png";
const UPI_QR_FALLBACK_PATH = "/upi-scanner-placeholder.svg";

const resolveQrImagePath = (path?: string) => {
  const normalizedPath = path?.trim();
  if (!normalizedPath || normalizedPath === UPI_QR_IMAGE_PATH) {
    return UPI_QR_FALLBACK_PATH;
  }
  return normalizedPath;
};

type PaymentConfig = {
  upiQrImageUrl: string;
  upiId: string;
  paytmNumber: string;
  phonepeNumber: string;
  gpayNumber: string;
  codEnabled: boolean;
  updatedAt: string;
};

export default function PaymentPage() {
  const router = useRouter();
  const dataSourceMode = getDataSourceMode();
  const user = useAuthStore((s) => s.user);
  const { items, clearCart } = useCartStore();
  const placeOrder = useOrderStore((s) => s.placeOrder);

  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [qrPreview, setQrPreview] = useState<string>(resolveQrImagePath());
  const [qrImageAvailable, setQrImageAvailable] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("nmart-pending-checkout");
    if (!raw) {
      router.replace("/user/checkout");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PendingCheckout;
      setPendingCheckout(parsed);
    } catch {
      router.replace("/user/checkout");
    }
  }, [router]);

  useEffect(() => {
    const loadPaymentConfig = async () => {
      const response = await fetch("/api/payments/config", { cache: "no-store" });
      if (!response.ok) return;
      const config = (await response.json()) as PaymentConfig;
      setPaymentConfig(config);
      setQrPreview(resolveQrImagePath(config.upiQrImageUrl));
    };

    void loadPaymentConfig();
  }, []);

  useEffect(() => {
    router.prefetch("/user/order-confirmation");
  }, [router]);

  const methodOptions = useMemo(
    () => {
      const codEnabled = paymentConfig?.codEnabled ?? true;
      return [
      { key: "paytm" as const, label: "Paytm", icon: Smartphone },
      { key: "phonepe" as const, label: "PhonePe", icon: Smartphone },
      { key: "gpay" as const, label: "Google Pay", icon: Smartphone },
      { key: "upi_scanner" as const, label: "UPI Scanner", icon: CreditCard },
      ...(codEnabled ? [{ key: "cod" as const, label: "Cash on Delivery", icon: Landmark }] : []),
    ];
    },
    [paymentConfig?.codEnabled]
  );

  const handlePlaceOrder = async () => {
    if (!pendingCheckout) return;
    if (items.length === 0) {
      setError("Your cart is empty. Please add items before payment.");
      return;
    }

    if (!method) {
      setError("Please select a payment method.");
      return;
    }

    if (method === "upi_scanner") {
      if (!utrNumber.trim()) {
        setError("Please enter UTR number.");
        return;
      }
      if (!paymentScreenshot) {
        setError("Please upload payment screenshot.");
        return;
      }
    }

    setError(null);
    setPlacingOrder(true);

    const paymentNote =
      method === "upi_scanner"
        ? `Payment: UPI Scanner, UTR: ${utrNumber.trim()}, Screenshot: ${paymentScreenshot?.name ?? "uploaded"}`
        : method === "cod"
          ? "Payment: Cash on Delivery"
          : `Payment: ${method.toUpperCase()}`;

    const normalizedAddress = pendingCheckout.instructions.trim()
      ? `${pendingCheckout.address} (Instructions: ${pendingCheckout.instructions.trim()}; ${paymentNote})`
      : `${pendingCheckout.address} (${paymentNote})`;

    const payload = {
      userId: user?.id ?? "u1",
      userName: user?.name ?? "John Doe",
      userMobile: pendingCheckout.mobile,
      userAddress: normalizedAddress,
      items,
    };
    const amount = items.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);

    let orderId = `ord-${Date.now()}`;
    if (dataSourceMode === "api") {
      const result = await getOrderRepository().placeOrder(payload);
      if (!result.ok || !result.order) {
        setError("Could not place order. Please try again.");
        setPlacingOrder(false);
        return;
      }
      orderId = result.order.id;
    } else {
      const created = placeOrder(payload);
      orderId = created.id;
    }

    void fetch("/api/payments/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(user?.role ? { "x-user-role": user.role } : {}),
        ...(user?.id ? { "x-user-id": user.id } : {}),
      },
      body: JSON.stringify({
        orderId,
        userName: user?.name ?? "John Doe",
        amount,
        method,
        utrNumber: method === "upi_scanner" ? utrNumber : undefined,
        screenshotFileName: method === "upi_scanner" ? paymentScreenshot?.name : undefined,
      }),
    });

    clearCart();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("nmart-pending-checkout");
    }

    router.push(`/user/order-confirmation?orderId=${orderId}&address=${encodeURIComponent(normalizedAddress)}`);
  };

  if (!pendingCheckout) {
    return (
      <div className="space-y-4">
        <BackButton />
        <p className="text-sm text-muted-foreground">Preparing payment step...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 sm:space-y-6">
      <BackButton />

      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Choose payment method</h1>
        <p className="text-sm text-muted-foreground mt-1">Select your preferred option and complete payment.</p>
      </div>

      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle>Payment methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {methodOptions.map((option) => {
              const Icon = option.icon;
              const selected = method === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setMethod(option.key)}
                  className={`rounded-lg border p-3 text-left transition sm:p-4 ${
                    selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <span className={`h-3 w-3 rounded-full ${selected ? "bg-primary" : "bg-muted"}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {!method && <p className="text-sm text-muted-foreground">No payment method selected yet.</p>}

          {method === "upi_scanner" && (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <p className="text-sm font-medium">Scan and pay using this UPI QR</p>
              {qrImageAvailable ? (
                <Image
                  src={qrPreview}
                  alt="UPI scanner"
                  width={400}
                  height={400}
                  unoptimized
                  className="w-full max-w-[14rem] rounded-lg border border-border bg-black/5 sm:max-w-xs"
                  onError={() => {
                    if (qrPreview !== UPI_QR_FALLBACK_PATH) {
                      setQrPreview(UPI_QR_FALLBACK_PATH);
                      return;
                    }
                    setQrImageAvailable(false);
                  }}
                />
              ) : (
                <div className="w-full max-w-[14rem] rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground sm:max-w-xs">
                  UPI QR image not found.
                </div>
              )}
              <p className="text-xs text-muted-foreground">Default path: public/upi-scanner.png</p>
              {paymentConfig?.upiId && <p className="text-sm text-muted-foreground">UPI ID: {paymentConfig.upiId}</p>}
              {!paymentConfig?.upiId && <p className="text-xs text-muted-foreground">UPI ID will be configured by admin.</p>}
              <div className="space-y-2">
                <label className="text-sm font-medium block">Upload payment screenshot</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentScreenshot(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm"
                />
                {paymentScreenshot && <p className="text-xs text-muted-foreground">Selected: {paymentScreenshot.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium block">UTR number</label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Enter UTR number"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {method !== "upi_scanner" && (
            <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
              {method === "paytm" && <p>Paytm number: {paymentConfig?.paytmNumber || "Not configured"}</p>}
              {method === "phonepe" && <p>PhonePe number: {paymentConfig?.phonepeNumber || "Not configured"}</p>}
              {method === "gpay" && <p>Google Pay number: {paymentConfig?.gpayNumber || "Not configured"}</p>}
              {method === "cod" && <p>Cash on Delivery selected.</p>}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => router.push("/user/checkout")}>Back to checkout</Button>
            <Button className="w-full bg-gradient-to-r from-primary to-primary/90 sm:w-auto" onClick={() => void handlePlaceOrder()} disabled={placingOrder}>
              {placingOrder ? "Placing order..." : "Confirm payment & place order"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
