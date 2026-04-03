import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthMethod, LoginActivity, User, UserRole } from "@/types";

type StoredCredential = {
  email: string;
  password: string;
  userId: string;
};

const DEFAULT_USERS: User[] = [
  { id: "admin-1", name: "Admin", email: "admin@nmart.com", role: "admin", blocked: false },
  { id: "pm-1", name: "Product Manager", email: "pm@nmart.com", role: "pm", blocked: false },
  { id: "db-1", name: "Delivery Boy", email: "delivery@nmart.com", role: "delivery", blocked: false },
  { id: "u1", name: "John Doe", email: "user@nmart.com", mobile: "9876543210", role: "user", blocked: false },
];

const DEFAULT_CREDENTIALS: StoredCredential[] = [
  { email: "admin@nmart.com", password: "admin123", userId: "admin-1" },
  { email: "pm@nmart.com", password: "pm123", userId: "pm-1" },
  { email: "delivery@nmart.com", password: "delivery123", userId: "db-1" },
  { email: "user@nmart.com", password: "user123", userId: "u1" },
];

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
  hasHydrated: boolean;
  users: User[];
  credentials: StoredCredential[];
  loginActivities: LoginActivity[];
  createManagedUser: (input: { name: string; email: string; password: string; role: UserRole; mobile?: string }) => { ok: boolean; user?: User; error?: string };
  setUserAccess: (userId: string, blocked: boolean) => { ok: boolean; user?: User; error?: string };
  login: (email: string, password: string) => { success: boolean; redirect?: string; error?: string };
  signup: (name: string, email: string, password: string, mobile?: string) => { success: boolean; error?: string };
  logout: () => void;
  getRedirectAfterLogin: (email: string, password: string) => string | null;
  getAllUsers: () => User[];
  getRecentLoginActivities: (limit?: number) => LoginActivity[];
  clearLoginActivities: (olderThanDays?: number) => void;
  updateProfile: (updates: { name?: string; mobile?: string }) => { success: boolean; error?: string };
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function createActivity(params: {
  email: string;
  method: AuthMethod;
  status: "success" | "failed";
  user?: User;
}): LoginActivity {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: normalizeEmail(params.email),
    method: params.method,
    status: params.status,
    userId: params.user?.id,
    role: params.user?.role,
    timestamp: new Date().toISOString(),
  };
}

function pushActivity(state: AuthState, activity: LoginActivity): LoginActivity[] {
  return [activity, ...state.loginActivities].slice(0, 200);
}

function canCreateManagedUsers(role: UserRole | null) {
  return role === "admin";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      users: DEFAULT_USERS,
      credentials: DEFAULT_CREDENTIALS,
      loginActivities: [],
      createManagedUser: (input) => {
        if (!canCreateManagedUsers(get().user?.role ?? null)) {
          return { ok: false, error: "Unauthorized" };
        }

        const normalizedEmail = normalizeEmail(input.email);
        const exists = get().credentials.some((item) => item.email === normalizedEmail);
        if (exists) return { ok: false, error: "Email already registered" };

        const newUser: User = {
          id: `u-${Date.now()}`,
          name: input.name.trim(),
          email: normalizedEmail,
          mobile: input.mobile?.trim(),
          role: input.role,
          blocked: false,
        };

        set((state) => ({
          users: [newUser, ...state.users],
          credentials: [
            { email: normalizedEmail, password: input.password, userId: newUser.id },
            ...state.credentials,
          ],
        }));

        return { ok: true, user: newUser };
      },
      setUserAccess: (userId: string, blocked: boolean) => {
        if (get().user?.role !== "admin") {
          return { ok: false, error: "Unauthorized" };
        }

        const target = get().users.find((item) => item.id === userId);
        if (!target) return { ok: false, error: "User not found" };

        const updatedUser = { ...target, blocked };
        set((state) => ({
          users: state.users.map((item) => (item.id === userId ? updatedUser : item)),
          user: state.user?.id === userId && blocked ? null : state.user,
          isAuthenticated: state.user?.id === userId && blocked ? false : state.isAuthenticated,
        }));

        return { ok: true, user: updatedUser };
      },
      login: (email: string, password: string) => {
        const normalizedEmail = normalizeEmail(email);
        const state = get();
        const credential = state.credentials.find((item) => item.email === normalizedEmail);
        const matchedUser = credential
          ? state.users.find((item) => item.id === credential.userId)
          : undefined;

        if (!credential || credential.password !== password || !matchedUser) {
          set((current) => ({
            loginActivities: pushActivity(
              current,
              createActivity({
                email: normalizedEmail,
                method: "password",
                status: "failed",
              })
            ),
          }));
          return { success: false, error: "Invalid email or password" };
        }

        if (matchedUser.blocked) {
          set((current) => ({
            loginActivities: pushActivity(
              current,
              createActivity({
                email: normalizedEmail,
                method: "password",
                status: "failed",
                user: matchedUser,
              })
            ),
          }));
          return { success: false, error: "Account is blocked" };
        }

        set((current) => ({
          user: matchedUser,
          isAuthenticated: true,
          loginActivities: pushActivity(
            current,
            createActivity({
              email: normalizedEmail,
              method: "password",
              status: "success",
              user: matchedUser,
            })
          ),
        }));

        return { success: true, redirect: getRedirectPath(matchedUser.role) };
      },
      signup: (name: string, email: string, password: string, mobile?: string) => {
        const normalizedEmail = normalizeEmail(email);
        const exists = get().credentials.some((item) => item.email === normalizedEmail);
        if (exists) return { success: false, error: "Email already registered" };

        const newUser: User = { id: `u-${Date.now()}`, name, email: normalizedEmail, mobile, role: "user", blocked: false };

        set((state) => ({
          users: [newUser, ...state.users],
          credentials: [
            { email: normalizedEmail, password, userId: newUser.id },
            ...state.credentials,
          ],
          user: newUser,
          isAuthenticated: true,
          loginActivities: pushActivity(
            state,
            createActivity({
              email: normalizedEmail,
              method: "signup",
              status: "success",
              user: newUser,
            })
          ),
        }));

        return { success: true };
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      getRedirectAfterLogin: (email: string, password: string) => {
        const normalizedEmail = normalizeEmail(email);
        const state = get();
        const credential = state.credentials.find((item) => item.email === normalizedEmail);
        if (!credential || credential.password !== password) return null;
        const matchedUser = state.users.find((item) => item.id === credential.userId);
        if (!matchedUser || matchedUser.blocked) return null;
        return getRedirectPath(matchedUser.role);
      },
      getAllUsers: () => get().users,
      getRecentLoginActivities: (limit = 15) => get().loginActivities.slice(0, limit),
      clearLoginActivities: (olderThanDays) => {
        if (olderThanDays == null) {
          set({ loginActivities: [] });
          return;
        }

        const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
        set((state) => ({
          loginActivities: state.loginActivities.filter(
            (item) => new Date(item.timestamp).getTime() >= cutoff
          ),
        }));
      },
      updateProfile: (updates) => {
        const currentUser = get().user;
        if (!currentUser) {
          return { success: false, error: "Not authenticated" };
        }

        const nextUser: User = {
          ...currentUser,
          name: updates.name?.trim() || currentUser.name,
          mobile: updates.mobile?.trim() || currentUser.mobile,
        };

        set((state) => ({
          user: nextUser,
          users: state.users.map((item) => (item.id === nextUser.id ? nextUser : item)),
        }));

        return { success: true };
      },
    }),
    {
      name: "nmart-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
        credentials: state.credentials,
        loginActivities: state.loginActivities,
      }),
      onRehydrateStorage: () => (state) => {
        useAuthStore.setState({ hasHydrated: true });
      },
      merge: (persisted, current) => {
        const saved = persisted as Partial<AuthState>;
        return {
          ...current,
          ...saved,
          hasHydrated: true,
          users: saved.users && saved.users.length > 0 ? saved.users : current.users,
          credentials:
            saved.credentials && saved.credentials.length > 0
              ? saved.credentials
              : current.credentials,
          loginActivities: saved.loginActivities ?? current.loginActivities,
        };
      },
    }
  )
);
