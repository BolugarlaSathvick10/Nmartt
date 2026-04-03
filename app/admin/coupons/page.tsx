"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Edit, Power, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useAuthStore } from "@/store";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  expiryDate: string;
  active: boolean;
  usageCount: number;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CouponsPage() {
  const t = useTranslations();
  const user = useAuthStore((state) => state.user);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: "",
    discount: 10,
    minOrder: 0,
    expiryDate: "",
    active: true,
  });

  const authHeaders = {
    "Content-Type": "application/json",
    ...(user?.role ? { "x-user-role": user.role } : {}),
    ...(user?.id ? { "x-user-id": user.id } : {}),
  };

  const loadCoupons = async () => {
    const response = await fetch("/api/coupons", { cache: "no-store" });
    if (!response.ok) return;
    const rows = (await response.json()) as Coupon[];
    setCoupons(rows);
  };

  useEffect(() => {
    void loadCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discount: 10,
      minOrder: 0,
      expiryDate: "",
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData(coupon);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.expiryDate) {
      alert(t("adminCoupons.fillAllFields"));
      return;
    }

    if (editingCoupon) {
      const response = await fetch(`/api/coupons/${editingCoupon.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          code: formData.code,
          discount: formData.discount || 10,
          minOrder: formData.minOrder || 0,
          expiryDate: formData.expiryDate,
          active: formData.active ?? true,
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        alert(data.error ?? "Failed to update coupon.");
        return;
      }
    } else {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          code: formData.code,
          discount: formData.discount || 10,
          minOrder: formData.minOrder || 0,
          expiryDate: formData.expiryDate,
          active: formData.active ?? true,
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        alert(data.error ?? "Failed to create coupon.");
        return;
      }
    }
    await loadCoupons();
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("adminCoupons.deleteConfirm"))) {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        alert(data.error ?? "Failed to delete coupon.");
        return;
      }
      await loadCoupons();
    }
  };

  const handleToggle = async (id: string) => {
    const response = await fetch(`/api/coupons/${id}/toggle`, {
      method: "PATCH",
      headers: authHeaders,
    });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      alert(data.error ?? "Failed to update coupon status.");
      return;
    }
    await loadCoupons();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-6 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {t("adminCoupons.title")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t("adminCoupons.subtitle")}
            </p>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> {t("adminCoupons.newCoupon")}
          </Button>
        </div>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-900">{t("adminCoupons.code")}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t("adminCoupons.discount")}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t("adminCoupons.minOrder")}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t("adminCoupons.expiry")}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t("adminCoupons.usage")}</th>
                  <th className="text-left p-4 font-medium text-gray-900">{t("adminCoupons.status")}</th>
                  <th className="text-right p-4 font-medium text-gray-900">{t("adminCoupons.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <motion.tr
                    key={coupon.id}
                    variants={item}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-mono font-medium text-gray-900">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900 font-medium">
                        {coupon.discount}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-700">₹{coupon.minOrder}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900 font-medium">
                        {coupon.usageCount}
                      </span>
                    </td>
                    <td className="p-4">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium gap-1 ${
                          coupon.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {coupon.active ? (
                          <>
                            <Eye className="h-3 w-3" /> {t("adminCoupons.active")}
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" /> {t("adminCoupons.inactive")}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(coupon.id)}
                          title={coupon.active ? t("adminCoupons.deactivate") : t("adminCoupons.activate")}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <Power className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(coupon)}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(coupon.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close coupon backdrop"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-[81] w-[95vw] max-h-[88vh] overflow-y-auto rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl sm:max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCoupon ? t("adminCoupons.editCoupon") : t("adminCoupons.createNewCoupon")}
              </h2>
              <Button type="button" variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 pb-1">
              <div>
                <Label className="text-sm font-medium text-gray-900">{t("adminCoupons.couponCode")}</Label>
                <Input
                  placeholder={t("adminCoupons.couponCodePlaceholder")}
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  className="mt-2 border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-900">{t("adminCoupons.discountPercent")}</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.discount || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discount: Number(e.target.value),
                      }))
                    }
                    className="mt-2 border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900">{t("adminCoupons.minOrderInr")}</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={formData.minOrder || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minOrder: Number(e.target.value),
                      }))
                    }
                    className="mt-2 border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900">{t("adminCoupons.expiryDate")}</Label>
                <Input
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
                  }
                  className="mt-2 border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <input
                  type="checkbox"
                  checked={formData.active ?? true}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, active: e.target.checked }))
                  }
                  className="rounded border-gray-200"
                />
                <label className="text-sm text-gray-700">
                  {formData.active ? t("adminCoupons.active") : t("adminCoupons.inactive")}
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border border-gray-200"
              >
                {t("adminCoupons.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {editingCoupon ? t("adminCoupons.update") : t("adminCoupons.create")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
