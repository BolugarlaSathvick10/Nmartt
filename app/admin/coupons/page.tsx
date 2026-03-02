"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Edit, Power, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  expiryDate: string;
  active: boolean;
  usageCount: number;
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: "c1",
    code: "SAVE10",
    discount: 10,
    minOrder: 500,
    expiryDate: "2026-12-31",
    active: true,
    usageCount: 245,
  },
  {
    id: "c2",
    code: "FESTIVE20",
    discount: 20,
    minOrder: 1000,
    expiryDate: "2026-03-31",
    active: true,
    usageCount: 512,
  },
  {
    id: "c3",
    code: "WELCOME5",
    discount: 5,
    minOrder: 0,
    expiryDate: "2025-12-31",
    active: false,
    usageCount: 89,
  },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: "",
    discount: 10,
    minOrder: 0,
    expiryDate: "",
    active: true,
  });

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

  const handleSave = () => {
    if (!formData.code || !formData.expiryDate) {
      alert("Please fill all fields");
      return;
    }

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? { ...c, ...formData, code: formData.code!, expiryDate: formData.expiryDate! }
            : c
        )
      );
    } else {
      const newCoupon: Coupon = {
        id: `c${Date.now()}`,
        code: formData.code!,
        discount: formData.discount || 10,
        minOrder: formData.minOrder || 0,
        expiryDate: formData.expiryDate!,
        active: formData.active ?? true,
        usageCount: 0,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this coupon?")) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleToggle = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );
  };

  return (
    <div className="space-y-8">
      <motion.div variants={container} initial="hidden" animate="show">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Coupons & Offers
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage promotional codes and discounts
            </p>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> New Coupon
          </Button>
        </div>

        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-900">Code</th>
                  <th className="text-left p-4 font-medium text-gray-900">Discount</th>
                  <th className="text-left p-4 font-medium text-gray-900">Min Order</th>
                  <th className="text-left p-4 font-medium text-gray-900">Expiry</th>
                  <th className="text-left p-4 font-medium text-gray-900">Usage</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                  <th className="text-right p-4 font-medium text-gray-900">Actions</th>
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
                            <Eye className="h-3 w-3" /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" /> Inactive
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
                          title={coupon.active ? "Deactivate" : "Activate"}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-white rounded-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium text-gray-900">Coupon Code</Label>
              <Input
                placeholder="e.g., SAVE10"
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
                className="mt-2 border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-900">Discount %</Label>
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
                <Label className="text-sm font-medium text-gray-900">Min Order (₹)</Label>
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
              <Label className="text-sm font-medium text-gray-900">Expiry Date</Label>
              <Input
                type="date"
                value={formData.expiryDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
                }
                className="mt-2 border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.active ?? true}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, active: e.target.checked }))
                }
                className="rounded border-gray-200"
              />
              <label className="text-sm text-gray-700">
                {formData.active ? "Active" : "Inactive"}
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {editingCoupon ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
