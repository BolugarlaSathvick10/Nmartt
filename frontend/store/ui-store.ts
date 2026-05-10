import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  cartOpen: boolean;
  authDialogOpen: boolean;
  authDialogReason: string | null;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  openAuthDialog: (reason?: string) => void;
  closeAuthDialog: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: false,
      cartOpen: false,
      authDialogOpen: false,
      authDialogReason: null,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCartOpen: (open) => set({ cartOpen: open }),
      openAuthDialog: (reason) => set({ authDialogOpen: true, authDialogReason: reason ?? null }),
      closeAuthDialog: () => set({ authDialogOpen: false, authDialogReason: null }),
    }),
    {
      name: "nmart-ui",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
