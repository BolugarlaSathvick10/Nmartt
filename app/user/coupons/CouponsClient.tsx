"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface UserCoupon {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  expiryDate: string;
  active: boolean;
}

type Props = {
  initialCoupons: UserCoupon[];
};

export default function CouponsClient({ initialCoupons }: Props) {
  const t = useTranslations();
  const [coupons, setCoupons] = useState<UserCoupon[]>(initialCoupons ?? []);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(true);

  useEffect(() => {
    // Poll for updates in background, but initial render uses server data
    let mounted = true;
    const loadCoupons = async () => {
      try {
        const res = await fetch("/api/coupons", { cache: "no-store" });
        if (!res.ok) return;
        const rows = (await res.json()) as UserCoupon[];
        if (!mounted) return;
        setCoupons(rows);
      } finally {
        setHasLoadedOnce(true);
      }
    };

    // refresh once after mount to ensure freshness
    void loadCoupons();
    const timer = setInterval(() => {
      void loadCoupons();
    }, 6000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeCoupons = coupons.filter(
    (coupon) => coupon.active && new Date(`${coupon.expiryDate}T23:59:59`).getTime() >= Date.now()
  );
  const usedCoupons = coupons.filter(
    (coupon) => !coupon.active || new Date(`${coupon.expiryDate}T23:59:59`).getTime() < Date.now()
  );

  return (
    <div className="space-y-6">
      <BackButton />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("coupons.title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("coupons.subtitle")}</p>
        </div>

        {/* Active Coupons */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t("coupons.activeCoupons", { count: activeCoupons.length })}</h2>
          {!hasLoadedOnce ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((idx) => (
                <Card key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                  <div className="space-y-3">
                    <div className="h-5 w-1/3 rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-100" />
                    <div className="h-4 w-1/2 rounded bg-gray-100" />
                  </div>
                </Card>
              ))}
            </div>
          ) : activeCoupons.length > 0 ? (
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
                            <h3 className="text-lg font-bold text-gray-900">{coupon.discount}% {t("coupons.off")}</h3>
                            <p className="text-sm text-gray-600">Use this coupon at checkout for instant discount.</p>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                          <p>
                            <span className="font-medium">{t("coupons.code")}</span> {coupon.code}
                          </p>
                          <p>
                            <span className="font-medium">{t("coupons.minOrder")}</span> ₹{coupon.minOrder}
                          </p>
                          <p>
                            <span className="font-medium">{t("coupons.expires")}</span> {new Date(coupon.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCopy(coupon.code)}
                        className={`flex-shrink-0 transition-all ${
                          copiedCode === coupon.code ? "bg-green-400 hover:bg-green-100 text-white-600" : "bg-green-400 hover:bg-green-100 text-white-600"
                        }`}
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="h-4 w-4 mr-2" /> {t("coupons.copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" /> {t("coupons.copy")}
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
              <p className="text-gray-600">{t("coupons.noActive")}</p>
            </Card>
          )}
        </div>

        {/* Used Coupons */}
        {usedCoupons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t("coupons.usedCoupons", { count: usedCoupons.length })}</h2>
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
                            <h3 className="text-lg font-bold text-gray-600">{coupon.discount}% {t("coupons.off")}</h3>
                            <p className="text-sm text-gray-500">Not currently usable for checkout.</p>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                          <p>
                            <span className="font-medium">{t("coupons.code")}</span> {coupon.code}
                          </p>
                          <p className="text-gray-400">{t("coupons.alreadyUsed")}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium">{t("coupons.used")}</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-green-50 rounded-xl border border-green-100 p-6">
          <h3 className="font-semibold text-green-900 mb-2">{t("coupons.howToUseTitle")}</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>• {t("coupons.howToUse1")}</li>
            <li>• {t("coupons.howToUse2")}</li>
            <li>• {t("coupons.howToUse3")}</li>
            <li>• {t("coupons.howToUse4")}</li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
}
