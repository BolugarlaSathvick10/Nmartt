import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";

const MOCK_CREDENTIALS: Record<string, { password: string; user: User }> = {
  "admin@nmart.com": {
    password: "admin123",
    user: { id: "admin-1", name: "Admin", email: "admin@nmart.com", role: "admin" },
  },
  "pm@nmart.com": {
    password: "pm123",
    user: { id: "pm-1", name: "Product Manager", email: "pm@nmart.com", role: "pm" },
  },
  "delivery@nmart.com": {
    password: "delivery123",
    user: { id: "db-1", name: "Delivery Boy", email: "delivery@nmart.com", role: "delivery" },
  },
  "user@nmart.com": {
    password: "user123",
    user: { id: "u1", name: "John Doe", email: "user@nmart.com", mobile: "9876543210", role: "user" },
  },
};

function getRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin": return "/admin";
    case "pm": return "/pm";
    case "delivery": return "/delivery";
    case "user": return "/user/home";
    default: return "/";
  }
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; redirect?: string; error?: string };
  signup: (name: string, email: string, password: string, mobile?: string) => { success: boolean; error?: string };
  logout: () => void;
  getRedirectAfterLogin: (email: string, password: string) => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        const key = email.toLowerCase().trim();
        const cred = MOCK_CREDENTIALS[key];
        if (!cred || cred.password !== password) {
          return { success: false, error: "Invalid email or password" };
        }
        set({ user: cred.user, isAuthenticated: true });
        return { success: true, redirect: getRedirectPath(cred.user.role) };
      },
      signup: (name: string, email: string, password: string) => {
        const key = email.toLowerCase().trim();
        if (MOCK_CREDENTIALS[key]) return { success: false, error: "Email already registered" };
        const newUser: User = { id: `u-${Date.now()}`, name, email: key, role: "user" };
        MOCK_CREDENTIALS[key] = { password, user: newUser };
        set({ user: newUser, isAuthenticated: true });
        return { success: true };
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      getRedirectAfterLogin: (email: string, password: string) => {
        const key = email.toLowerCase().trim();
        const cred = MOCK_CREDENTIALS[key];
        if (!cred || cred.password !== password) return null;
        return getRedirectPath(cred.user.role);
      },
    }),
    { name: "nmart-auth" }
  )
);
