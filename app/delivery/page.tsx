"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, IndianRupee, Save, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { getAuthRepository, getDataSourceMode, getOrderRepository } from "@/lib/repositories";
import { useAuthStore, useOrderStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const mockEarnings = 12500;

export default function DeliveryDashboardPage() {
  const t = useTranslations();
  const dataSourceMode = getDataSourceMode();
  const user = useAuthStore((s) => s.user);
  const localOrders = useOrderStore((s) => s.orders);
  const [apiOrders, setApiOrders] = useState<typeof localOrders>([]);
  const isApiMode = dataSourceMode === "api";
  const orders = isApiMode ? apiOrders : localOrders;
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [aadhaarImage, setAadhaarImage] = useState("");
  const [drivingLicenseImage, setDrivingLicenseImage] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (!isApiMode) return;
    let active = true;
    const load = async () => {
      try {
        const rows = await getOrderRepository().getOrders();
        if (!active) return;
        setApiOrders(rows);
      } catch {}
    };

    void load();

    const intervalId = window.setInterval(() => {
      void load();
    }, 4000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isApiMode]);

  useEffect(() => {
    setAadhaarNumber(user?.aadhaarNumber ?? "");
    setDrivingLicenseNumber(user?.drivingLicenseNumber ?? "");
    setAadhaarImage(user?.aadhaarImage ?? "");
    setDrivingLicenseImage(user?.drivingLicenseImage ?? "");
    setVehicleNumber(user?.vehicleNumber ?? "");
    setAddress(user?.address ?? "");
  }, [user]);

  const assignedOrders = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled" && (o.deliveryBoyName === user?.name || o.status === "pending")
  );
  const deliveredCount = orders.filter((o) => o.status === "delivered" && o.deliveryBoyName === user?.name).length;

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage("");
    const result = await getAuthRepository().updateProfile({
      aadhaarNumber,
      drivingLicenseNumber,
      aadhaarImage,
      drivingLicenseImage,
      vehicleNumber,
      address,
    });
    setSavingProfile(false);
    setProfileMessage(result.ok ? "KYC details saved successfully." : result.error ?? "Failed to save profile details.");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboards.delivery.title")}</h1>
        <p className="text-muted-foreground">{t("dashboards.delivery.subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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

      <Card>
        <CardHeader>
          <CardTitle>Delivery Profile & KYC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Aadhaar Number</Label>
              <Input value={aadhaarNumber} onChange={(event) => setAadhaarNumber(event.target.value)} className="mt-1" placeholder="1234 5678 9012" />
            </div>
            <div>
              <Label>Driving License Number</Label>
              <Input value={drivingLicenseNumber} onChange={(event) => setDrivingLicenseNumber(event.target.value)} className="mt-1" placeholder="DL-0420110149646" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Aadhaar Image URL</Label>
              <Input value={aadhaarImage} onChange={(event) => setAadhaarImage(event.target.value)} className="mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label>Driving License Image URL</Label>
              <Input value={drivingLicenseImage} onChange={(event) => setDrivingLicenseImage(event.target.value)} className="mt-1" placeholder="https://..." />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Vehicle Number</Label>
              <Input value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value)} className="mt-1" placeholder="TS09AB1234" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={address} onChange={(event) => setAddress(event.target.value)} className="mt-1" placeholder="Current residential address" />
            </div>
          </div>

          {profileMessage && (
            <p className="text-sm text-muted-foreground">{profileMessage}</p>
          )}

          <Button onClick={() => void handleSaveProfile()} disabled={savingProfile}>
            <Save className="mr-2 h-4 w-4" /> {savingProfile ? "Saving..." : "Save Details"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
