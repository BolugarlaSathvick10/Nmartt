"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PaymentConfig = {
  upiQrImageUrl: string;
  upiId: string;
  paytmNumber: string;
  phonepeNumber: string;
  gpayNumber: string;
  codEnabled: boolean;
  updatedAt: string;
};

type PaymentRecord = {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  amount: number;
  method: "paytm" | "phonepe" | "gpay" | "cod" | "upi_scanner";
  utrNumber?: string;
  screenshotFileName?: string;
  status: "submitted" | "verified" | "rejected";
  createdAt: string;
};

const defaultConfig: PaymentConfig = {
  upiQrImageUrl: "/upi-scanner.png",
  upiId: "",
  paytmNumber: "",
  phonepeNumber: "",
  gpayNumber: "",
  codEnabled: true,
  updatedAt: "",
};

export default function AdminPaymentsPage() {
  const user = useAuthStore((s) => s.user);
  const [config, setConfig] = useState<PaymentConfig>(defaultConfig);
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(user?.role ? { "x-user-role": user.role } : {}),
      ...(user?.id ? { "x-user-id": user.id } : {}),
    }),
    [user?.id, user?.role]
  );

  const loadAll = useCallback(async () => {
    const [configRes, historyRes] = await Promise.all([
      fetch("/api/payments/config", { cache: "no-store" }),
      fetch("/api/payments/history", { cache: "no-store", headers }),
    ]);

    if (configRes.ok) {
      const configData = (await configRes.json()) as PaymentConfig;
      setConfig(configData);
    }

    if (historyRes.ok) {
      const historyData = (await historyRes.json()) as PaymentRecord[];
      setHistory(historyData);
    }
  }, [headers]);

  useEffect(() => {
    if (!user?.id || !user?.role) return;
    void loadAll();
  }, [loadAll, user?.id, user?.role]);

  const saveConfig = async () => {
    setSaving(true);
    setError(null);

    const response = await fetch("/api/payments/config", {
      method: "PATCH",
      headers,
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const failed = (await response.json()) as { error?: string };
      setError(failed.error ?? "Could not save payment settings");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as { config: PaymentConfig };
    setConfig(data.config);
    setSaving(false);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold">Payments Admin</h1>
          <p className="text-muted-foreground">Manage scanner image path, payment numbers, and review payment history.</p>
        </div>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>UPI QR image path (public)</Label>
              <Input
                value={config.upiQrImageUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, upiQrImageUrl: e.target.value }))}
                placeholder="/upi-scanner.png"
                className="mt-1"
              />
            </div>
            <div>
              <Label>UPI ID</Label>
              <Input
                value={config.upiId}
                onChange={(e) => setConfig((prev) => ({ ...prev, upiId: e.target.value }))}
                placeholder="yourname@bank"
                className="mt-1"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Paytm Number</Label>
                <Input
                  value={config.paytmNumber}
                  onChange={(e) => setConfig((prev) => ({ ...prev, paytmNumber: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>PhonePe Number</Label>
                <Input
                  value={config.phonepeNumber}
                  onChange={(e) => setConfig((prev) => ({ ...prev, phonepeNumber: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Google Pay Number</Label>
                <Input
                  value={config.gpayNumber}
                  onChange={(e) => setConfig((prev) => ({ ...prev, gpayNumber: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.codEnabled}
                onChange={(e) => setConfig((prev) => ({ ...prev, codEnabled: e.target.checked }))}
              />
              Enable Cash on Delivery
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center gap-3">
              <Button onClick={() => void saveConfig()} disabled={saving}>{saving ? "Saving..." : "Save Payment Settings"}</Button>
              {config.updatedAt && <p className="text-xs text-muted-foreground">Updated: {new Date(config.updatedAt).toLocaleString()}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Order</th>
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Method</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">UTR</th>
                    <th className="text-left py-2">Screenshot</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id} className="border-b">
                      <td className="py-2 pr-2">{new Date(row.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-2 font-mono">{row.orderId}</td>
                      <td className="py-2 pr-2">{row.userName}</td>
                      <td className="py-2 pr-2 uppercase">{row.method}</td>
                      <td className="py-2 pr-2">₹{row.amount}</td>
                      <td className="py-2 pr-2">{row.utrNumber ?? "-"}</td>
                      <td className="py-2 pr-2">{row.screenshotFileName ?? "-"}</td>
                      <td className="py-2 pr-2">{row.status}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td className="py-3 text-muted-foreground" colSpan={8}>No payment records yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
