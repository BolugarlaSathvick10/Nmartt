"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryMapClient } from "@/components/delivery-map-client";
import { getMockUserLocation } from "@/lib/locations";

type CheckoutForm = {
  address: string;
  mobile: string;
  pincode: string;
};

const COUPON_CODES: Record<string, number> = {
  "SAVE10": 0.10,
  "FESTIVE20": 0.20,
  "WELCOME5": 0.05,
};

function CouponBox() {
  const t = useTranslations();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    if (!coupon.trim()) {
      setError(t("checkout.enterCouponCode"));
      return;
    }
    if (COUPON_CODES[coupon.toUpperCase()]) {
      setApplied(coupon.toUpperCase());
      setError(null);
    } else {
      setError(t("checkout.invalidCouponCode"));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t("checkout.couponCode")}</label>
      <div className="flex gap-2">
        <Input
          placeholder={t("checkout.enterCouponCode")}
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleApply} variant="outline">{t("checkout.apply")}</Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {applied && <p className="text-xs text-green-600">{t("checkout.couponApplied", { code: applied })}</p>}
    </div>
  );
}

function getDiscountAmount(): number {
  if (typeof document === "undefined") return 0;
  const applied = document.querySelector(".text-green-600")?.textContent ?? "";
  const matches = applied.match(/SAVE\d+|FESTIVE\d+|WELCOME\d+/);
  if (!matches) return 0;
  const code = matches[0];
  const rate = COUPON_CODES[code];
  if (!rate) return 0;
  // Get subtotal from cart
  const items = useCartStore.getState().totalAmount();
  return Math.floor(items * rate);
}

export default function CheckoutPage() {
  const t = useTranslations();
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCartStore();
  const [locationValid, setLocationValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);
  /** When set, map uses this (from Access location); when null, map uses address + pincode */
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const form = useForm<CheckoutForm>({
    defaultValues: { address: "123 Main St, Apt 4B", mobile: "9876543210", pincode: "400001" },
  });

  const validateLocation = async () => {
    setValidating(true);
    setLocationError(null);
    await new Promise((r) => setTimeout(r, 800));
    setLocationValid(true);
    setValidating(false);
  };

  const accessLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError(t("checkout.geoNotSupported"));
      return;
    }
    setGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocationCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationValid(true);
        setGettingLocation(false);
      },
      () => {
        setLocationError(t("checkout.geoAccessFailed"));
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [t]);

  /** When user edits address/pincode, switch map back to address-based location */
  const address = form.watch("address");
  const pincode = form.watch("pincode");
  useEffect(() => {
    setCurrentLocationCoords((prev) => (prev ? null : prev));
  }, [address, pincode]);

  /** Map user location: from Access location (fixed shop → current location) or from address (fixed shop → address) */
  const userLocationForMap = currentLocationCoords ?? getMockUserLocation(address + " " + pincode);

  const onSubmit = (data: CheckoutForm) => {
    clearCart();
    router.push(`/user/order-confirmation?orderId=ord-${Date.now()}&address=${encodeURIComponent(data.address)}`);
  };

  if (items.length === 0 && !locationValid) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-2xl font-bold">{t("checkout.title")}</h1>
        <Card className="glass-card border-white/20">
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("checkout.cartEmpty")}{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/user/home")}>{t("checkout.continueShopping")}</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-2xl font-bold">{t("checkout.title")}</h1>

      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> {t("checkout.deliveryAddress")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("checkout.address")}</Label>
            <Input {...form.register("address", { required: true })} className="mt-1" placeholder={t("checkout.addressPlaceholder")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("checkout.mobile")}</Label>
              <Input {...form.register("mobile", { required: true })} className="mt-1" />
            </div>
            <div>
              <Label>{t("checkout.pincode")}</Label>
              <Input {...form.register("pincode", { required: true })} className="mt-1" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={validateLocation} disabled={validating}>
              {validating ? t("checkout.validatingLocation") : t("checkout.validateLocationMock")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={accessLocation}
              disabled={gettingLocation}
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              {gettingLocation ? t("checkout.gettingLocation") : t("checkout.accessLocation")}
            </Button>
            {locationValid === true && (
              <span className="flex items-center gap-1 text-sm text-primary">
                <CheckCircle className="h-4 w-4" /> {t("checkout.serviceable")}
              </span>
            )}
          </div>
          {locationError && (
            <p className="text-sm text-destructive">{locationError}</p>
          )}
          {currentLocationCoords && (
            <p className="text-sm text-muted-foreground">
              {t("checkout.usingCurrentLocation")}
            </p>
          )}
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">{t("checkout.routeTitle")}</p>
            <p className="text-xs text-muted-foreground mb-1">
              {t("checkout.routeSubtitle")}
            </p>
            <DeliveryMapClient
              userLocation={userLocationForMap}
              showRoute={true}
              height="220px"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle>{t("checkout.orderSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Coupon Input */}
          <CouponBox />

          <ul className="space-y-2 mt-4">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between text-sm">
                <span>{product.name} × {quantity}</span>
                <span>{formatPrice(product.price * quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between font-medium">
              <span>{t("checkout.subtotal")}</span>
              <span>{formatPrice(totalAmount())}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{t("checkout.discount")}</span>
              <span id="checkout-discount">{formatPrice(getDiscountAmount())}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>{t("checkout.finalTotal")}</span>
              <span id="checkout-final">{formatPrice(Math.max(0, totalAmount() - getDiscountAmount()))}</span>
            </div>
          </div>

          <Button
            className="w-full mt-4 bg-gradient-to-r from-primary to-primary/90"
            onClick={form.handleSubmit(onSubmit)}
          >
            {t("checkout.placeOrder")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
