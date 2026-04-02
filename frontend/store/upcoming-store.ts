import { create } from "zustand";
import { persist } from "zustand/middleware";

/** productId -> number of interests (mock: we don't track who, just count) */
interface UpcomingState {
  interestCounts: Record<string, number>;
  /** Current user has shown interest in these product IDs */
  myInterests: Set<string>;
  addInterest: (productId: string) => void;
  removeInterest: (productId: string) => void;
  hasInterest: (productId: string) => boolean;
  getCount: (productId: string) => number;
}

export const useUpcomingStore = create<UpcomingState>()(
  persist(
    (set, get) => ({
      interestCounts: {},
      myInterests: new Set<string>(),

      addInterest: (productId: string) => {
        set((state) => {
          const next = new Set(state.myInterests);
          next.add(productId);
          const count = (state.interestCounts[productId] ?? 0) + 1;
          return {
            myInterests: next,
            interestCounts: { ...state.interestCounts, [productId]: count },
          };
        });
      },

      removeInterest: (productId: string) => {
        set((state) => {
          const next = new Set(state.myInterests);
          next.delete(productId);
          const count = Math.max(0, (state.interestCounts[productId] ?? 0) - 1);
          return {
            myInterests: next,
            interestCounts: { ...state.interestCounts, [productId]: count },
          };
        });
      },

      hasInterest: (productId: string) => get().myInterests.has(productId),
      getCount: (productId: string) => get().interestCounts[productId] ?? 0,
    }),
    {
      name: "nmart-upcoming",
      partialize: (s) => ({
        interestCounts: s.interestCounts,
        myInterests: Array.from(s.myInterests),
      }),
      merge: (persisted, current) => {
        const p = persisted as { interestCounts?: Record<string, number>; myInterests?: string[] };
        return {
          ...current,
          interestCounts: p?.interestCounts ?? current.interestCounts,
          myInterests: new Set(p?.myInterests ?? []),
        };
      },
    }
  )
);
