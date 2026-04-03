import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Coupon = {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  expiryDate: string;
  active: boolean;
  usageCount: number;
  createdAt: string;
};

type CouponInput = {
  code: string;
  discount: number;
  minOrder: number;
  expiryDate: string;
  active?: boolean;
};

type CouponState = {
  coupons: Coupon[];
  addCoupon: (input: CouponInput) => { ok: boolean; error?: string };
  updateCoupon: (id: string, input: CouponInput) => { ok: boolean; error?: string };
  deleteCoupon: (id: string) => void;
  toggleCoupon: (id: string) => void;
  getActiveCoupons: () => Coupon[];
  findApplicableCoupon: (code: string, subtotal: number) => Coupon | null;
};

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "c1",
    code: "SAVE10",
    discount: 10,
    minOrder: 500,
    expiryDate: "2026-12-31",
    active: true,
    usageCount: 245,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "c2",
    code: "FESTIVE20",
    discount: 20,
    minOrder: 1000,
    expiryDate: "2026-03-31",
    active: true,
    usageCount: 512,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "c3",
    code: "WELCOME5",
    discount: 5,
    minOrder: 0,
    expiryDate: "2026-12-31",
    active: true,
    usageCount: 89,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function isExpired(expiryDate: string) {
  return new Date(`${expiryDate}T23:59:59`).getTime() < Date.now();
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupons: DEFAULT_COUPONS,
      addCoupon: (input) => {
        const code = normalizeCode(input.code);
        if (!code || !input.expiryDate) {
          return { ok: false, error: "Coupon code and expiry date are required." };
        }

        const exists = get().coupons.some((coupon) => coupon.code === code);
        if (exists) {
          return { ok: false, error: "Coupon code already exists." };
        }

        const newCoupon: Coupon = {
          id: `c-${Date.now()}`,
          code,
          discount: Math.max(1, Math.round(input.discount)),
          minOrder: Math.max(0, Math.round(input.minOrder)),
          expiryDate: input.expiryDate,
          active: input.active ?? true,
          usageCount: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ coupons: [newCoupon, ...state.coupons] }));
        return { ok: true };
      },
      updateCoupon: (id, input) => {
        const code = normalizeCode(input.code);
        if (!code || !input.expiryDate) {
          return { ok: false, error: "Coupon code and expiry date are required." };
        }

        const duplicates = get().coupons.some((coupon) => coupon.id !== id && coupon.code === code);
        if (duplicates) {
          return { ok: false, error: "Coupon code already exists." };
        }

        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === id
              ? {
                  ...coupon,
                  code,
                  discount: Math.max(1, Math.round(input.discount)),
                  minOrder: Math.max(0, Math.round(input.minOrder)),
                  expiryDate: input.expiryDate,
                  active: input.active ?? coupon.active,
                }
              : coupon
          ),
        }));

        return { ok: true };
      },
      deleteCoupon: (id) => {
        set((state) => ({ coupons: state.coupons.filter((coupon) => coupon.id !== id) }));
      },
      toggleCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === id ? { ...coupon, active: !coupon.active } : coupon
          ),
        }));
      },
      getActiveCoupons: () => get().coupons.filter((coupon) => coupon.active && !isExpired(coupon.expiryDate)),
      findApplicableCoupon: (code, subtotal) => {
        const normalized = normalizeCode(code);
        if (!normalized) return null;

        const coupon = get().coupons.find((item) => item.code === normalized);
        if (!coupon) return null;
        if (!coupon.active || isExpired(coupon.expiryDate)) return null;
        if (subtotal < coupon.minOrder) return null;

        return coupon;
      },
    }),
    {
      name: "nmart-coupons",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
