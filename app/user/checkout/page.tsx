"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, Navigation } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { localizeProductName } from "@/lib/localization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryMapClient } from "@/components/delivery-map-client";
import { getMockUserLocation } from "@/lib/locations";

type CheckoutForm = {
  address: string;
  mobile: string;
  pincode: string;
  instructions: string;
};

type CouponRow = {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  expiryDate: string;
  active: boolean;
};

function CouponBox({ onCouponRateChange }: { onCouponRateChange: (rate: number) => void }) {
  const t = useTranslations();
  const subtotal = useCartStore((state) => state.totalAmount());
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<CouponRow[]>([]);

  useEffect(() => {
    const loadCoupons = async () => {
      const response = await fetch("/api/coupons", { cache: "no-store" });
      if (!response.ok) return;
      const rows = (await response.json()) as CouponRow[];
      setAvailableCoupons(rows);
    };
    void loadCoupons();
  }, []);

  const eligibleCoupons = availableCoupons.filter(
    (couponRow) =>
      couponRow.active &&
      new Date(`${couponRow.expiryDate}T23:59:59`).getTime() >= Date.now() &&
      subtotal >= couponRow.minOrder
  );

  const handleRemoveCoupon = () => {
    setCoupon("");
    setApplied(null);
    setError(null);
    onCouponRateChange(0);
  };

  const handleApply = async () => {
    if (!coupon.trim()) {
      setError(t("checkout.enterCouponCode"));
      onCouponRateChange(0);
      return;
    }

    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, subtotal }),
    });

    if (response.ok) {
      const data = (await response.json()) as { coupon?: { code: string; discount: number } };
      setApplied(data.coupon?.code ?? coupon.toUpperCase());
      onCouponRateChange((data.coupon?.discount ?? 0) / 100);
      setError(null);
    } else {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? t("checkout.invalidCouponCode"));
      onCouponRateChange(0);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t("checkout.couponCode")}</label>
      <div className="space-y-1">
        <Select
          value={coupon}
          onValueChange={(value) => {
            setCoupon(value);
            setError(null);
            setApplied(null);
            onCouponRateChange(0);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("checkout.selectEligibleCoupon")} />
          </SelectTrigger>
          <SelectContent>
            {eligibleCoupons.length > 0 ? (
              eligibleCoupons.map((couponRow) => (
                <SelectItem key={couponRow.id} value={couponRow.code}>
                  {couponRow.code} - {couponRow.discount}% OFF
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                {t("checkout.noEligibleCoupons")}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder={t("checkout.enterCouponCode")}
          value={coupon}
          onChange={(e) => {
            setCoupon(e.target.value);
            setApplied(null);
            setError(null);
            onCouponRateChange(0);
          }}
          className="flex-1"
        />
        <Button onClick={handleApply} variant="outline" className="sm:w-auto">{t("checkout.apply")}</Button>
        <Button onClick={handleRemoveCoupon} variant="ghost" className="sm:w-auto">{t("checkout.removeCoupon")}</Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {applied && <p className="text-xs text-green-600">{t("checkout.couponApplied", { code: applied })}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { items, totalAmount } = useCartStore();
  const [locationValid, setLocationValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);
  /** When set, map uses this (from Access location); when null, map uses address + pincode */
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [couponDiscountRate, setCouponDiscountRate] = useState(0);
  const ignoreAddressResetCountRef = useRef(0);
  const form = useForm<CheckoutForm>({
    defaultValues: { address: "123 Main St, Apt 4B", mobile: "9876543210", pincode: "400001", instructions: "" },
  });

  const reverseGeocodeLocation = useCallback(
    async (lat: number, lng: number) => {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(lat),
        lon: String(lng),
        zoom: "18",
        addressdetails: "1",
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }

      const data = (await response.json()) as {
        display_name?: string;
        address?: {
          postcode?: string;
          road?: string;
          suburb?: string;
          city?: string;
          town?: string;
          village?: string;
          state?: string;
        };
      };

      const pin = (data.address?.postcode ?? "").replace(/\D/g, "").slice(0, 6);
      const composedAddress =
        [
          data.address?.road,
          data.address?.suburb,
          data.address?.city ?? data.address?.town ?? data.address?.village,
          data.address?.state,
        ]
          .filter(Boolean)
          .join(", ") || data.display_name || "";

      if (composedAddress) {
        ignoreAddressResetCountRef.current += 1;
        form.setValue("address", composedAddress, { shouldDirty: true });
      }
      if (pin.length === 6) {
        ignoreAddressResetCountRef.current += 1;
        form.setValue("pincode", pin, { shouldDirty: true });
      }
    },
    [form]
  );

  const validateLocation = async () => {
    setValidating(true);
    setLocationError(null);
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
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentLocationCoords({ lat, lng });
        setLocationValid(true);
        void (async () => {
          try {
            await reverseGeocodeLocation(lat, lng);
          } catch {
            setLocationError(t("checkout.autoAddressFillFailed"));
          } finally {
            setGettingLocation(false);
          }
        })();
      },
      () => {
        setLocationError(t("checkout.geoAccessFailed"));
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [reverseGeocodeLocation, t]);

  /** When user edits address/pincode, switch map back to address-based location */
  const address = form.watch("address");
  const pincode = form.watch("pincode");
  useEffect(() => {
    if (ignoreAddressResetCountRef.current > 0) {
      ignoreAddressResetCountRef.current -= 1;
      return;
    }
    setCurrentLocationCoords((prev) => (prev ? null : prev));
  }, [address, pincode]);

  useEffect(() => {
    router.prefetch("/user/payment");
  }, [router]);

  /** Map user location: from Access location (fixed shop → current location) or from address (fixed shop → address) */
  const userLocationForMap = currentLocationCoords ?? getMockUserLocation(address + " " + pincode);
  const subtotal = totalAmount();
  const discountAmount = Math.floor(subtotal * couponDiscountRate);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const onSubmit = async (data: CheckoutForm) => {
    const pendingCheckout = {
      address: data.address,
      mobile: data.mobile,
      pincode: data.pincode,
      instructions: data.instructions,
      couponDiscountRate,
      createdAt: Date.now(),
    };

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("nmart-pending-checkout", JSON.stringify(pendingCheckout));
    }

    router.push("/user/payment");
  };

  if (items.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-xl font-bold sm:text-2xl">{t("checkout.title")}</h1>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-8">
      <h1 className="text-xl font-bold sm:text-2xl">{t("checkout.title")}</h1>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("checkout.mobile")}</Label>
              <Input {...form.register("mobile", { required: true })} className="mt-1" />
            </div>
            <div>
              <Label>{t("checkout.pincode")}</Label>
              <Input {...form.register("pincode", { required: true })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>{t("checkout.deliveryInstructions")}</Label>
            <textarea
              {...form.register("instructions")}
              rows={3}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              placeholder={t("checkout.deliveryInstructionsPlaceholder")}
            />
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
          <CouponBox onCouponRateChange={setCouponDiscountRate} />

          <ul className="mt-4 space-y-2">
            {items.map(({ product, quantity, unit, unitPrice }) => (
              <li key={`${product.id}-${unit}`} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 pr-2">
                  {localizeProductName(product.name, locale)} × {quantity}
                  <span className="ml-2 text-xs text-muted-foreground">({unit})</span>
                </span>
                <span>{formatPrice(unitPrice * quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between font-medium">
              <span>{t("checkout.subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{t("checkout.discount")}</span>
              <span id="checkout-discount">{formatPrice(discountAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>{t("checkout.finalTotal")}</span>
              <span id="checkout-final">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-4 bg-gradient-to-r from-primary to-primary/90"
            onClick={form.handleSubmit((data) => void onSubmit(data))}
          >
            {t("checkout.proceedToPayment")}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
