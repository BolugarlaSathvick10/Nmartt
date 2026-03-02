"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface UserCoupon {
  id: string;
  code: string;
  discount: number;
  description: string;
  minOrder: number;
  expiryDate: string;
  used: boolean;
}

const AVAILABLE_COUPONS: UserCoupon[] = [
  {
    id: "c1",
    code: "SAVE10",
    discount: 10,
    description: "Flat 10% discount on all orders",
    minOrder: 500,
    expiryDate: "2026-12-31",
    used: false,
  },
  {
    id: "c2",
    code: "FESTIVE20",
    discount: 20,
    description: "20% off on orders above ₹1000",
    minOrder: 1000,
    expiryDate: "2026-03-31",
    used: false,
  },
  {
    id: "c3",
    code: "FRESH5",
    discount: 5,
    description: "₹5 off on fresh groceries",
    minOrder: 100,
    expiryDate: "2025-12-31",
    used: true,
  },
];

export default function UserCouponsPage() {
  const [coupons, setCoupons] = useState<UserCoupon[]>(AVAILABLE_COUPONS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeCoupons = coupons.filter((c) => !c.used);
  const usedCoupons = coupons.filter((c) => c.used);

  return (
    <div className="space-y-6">
      <BackButton />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Available Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and use exclusive discounts on your next purchase</p>
        </div>

          {/* Active Coupons */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Coupons ({activeCoupons.length})</h2>
            {activeCoupons.length > 0 ? (
              <motion.div variants={container} className="grid md:grid-cols-2 gap-6">
                {activeCoupons.map((coupon) => (
                  <motion.div key={coupon.id} variants={item}>
                    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 rounded-lg p-3">
                              <ShoppingCart className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{coupon.discount}% OFF</h3>
                              <p className="text-sm text-gray-600">{coupon.description}</p>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500 space-y-1">
                            <p>
                              <span className="font-medium">Code:</span> {coupon.code}
                            </p>
                            <p>
                              <span className="font-medium">Min Order:</span> ₹{coupon.minOrder}
                            </p>
                            <p>
                              <span className="font-medium">Expires:</span> {new Date(coupon.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCopy(coupon.code)}
                          className={`flex-shrink-0 transition-all ${
                            copiedCode === coupon.code
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-green-50 hover:bg-green-100 text-green-600"
                          }`}
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <Check className="h-4 w-4 mr-2" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" /> Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-600">No active coupons available at the moment.</p>
              </Card>
            )}
          </div>

          {/* Used Coupons */}
          {usedCoupons.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Used Coupons ({usedCoupons.length})</h2>
              <motion.div variants={container} className="grid md:grid-cols-2 gap-6">
                {usedCoupons.map((coupon) => (
                  <motion.div key={coupon.id} variants={item}>
                    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 opacity-80">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <ShoppingCart className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-600">{coupon.discount}% OFF</h3>
                              <p className="text-sm text-gray-500">{coupon.description}</p>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500 space-y-1">
                            <p>
                              <span className="font-medium">Code:</span> {coupon.code}
                            </p>
                            <p className="text-gray-400">Already used on your account</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium">Used</div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-green-50 rounded-xl border border-green-100 p-6">
            <h3 className="font-semibold text-green-900 mb-2">How to Use Coupons</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• Copy the coupon code and proceed to checkout</li>
              <li>• Paste the code in the coupon field during checkout</li>
              <li>• Discount will be applied automatically to your order</li>
              <li>• Some coupons have minimum order value requirements</li>
            </ul>
          </Card>
        </motion.div>
    </div>
  );
}
