"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import GuestBanner from "@/components/guest/GuestBanner";
import GuestAuthModal from "@/components/guest/GuestAuthModal";
import { useAuthStore, useUIStore } from "@/store";

function getRequiredRole(path: string): string | null {
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/pm")) return "pm";
  if (path.startsWith("/delivery")) return "delivery";
  if (path.startsWith("/user/checkout")) return "user";
  if (path.startsWith("/user/payment")) return "user";
  if (path.startsWith("/user/profile")) return "user";
  if (path.startsWith("/user/orders")) return "user";
  if (path.startsWith("/user/order-confirmation")) return "user";
  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const requiredRole = getRequiredRole(pathname);
  const isGuestUserArea = pathname.startsWith("/user") && !isAuthenticated;

  useEffect(() => {
    setCartOpen(false);
  }, [pathname, setCartOpen]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (requiredRole && isAuthenticated && user && requiredRole !== user.role) {
      const roleHome =
        user.role === "admin"
          ? "/admin"
          : user.role === "pm"
            ? "/pm"
            : user.role === "delivery"
              ? "/delivery"
              : "/user/home";
      router.replace(roleHome);
    }
  }, [hasHydrated, isAuthenticated, pathname, router, user]);

  if (!hasHydrated && requiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <span className="text-sm text-muted-foreground">Loading workspace...</span>
      </div>
    );
  }

  if (requiredRole && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/20">
        <Sidebar />
        <Header />
        <main
          className={cn(
              "mt-16 transition-[padding-left] duration-500 ease-in-out",
              sidebarOpen ? "pl-64" : "pl-16"
            )}
          style={{
            height: "calc(100vh - 4rem)",
            overflowY: "auto",
          }}
        >
          <Container>
            <div className="mx-auto mt-6 w-full max-w-xl rounded-xl border border-amber-300/80 bg-amber-50/70 p-5 text-center shadow-sm">
              <h1 className="text-xl font-semibold text-amber-950">Login required</h1>
              <p className="mt-1 text-sm text-amber-900/80">
                Please use login or sign up to continue to your orders, profile, or checkout.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <Link href="/login" className="inline-flex min-w-24 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm">
                  Login
                </Link>
                <Link href="/signup" className="inline-flex min-w-24 items-center justify-center rounded-md bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-green-400 hover:shadow-md">
                  Sign up
                </Link>
              </div>
            </div>
          </Container>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar />
      <Header />
      {isGuestUserArea && <GuestBanner />}
      <GuestAuthModal />
      <main
        className={cn(
          "mt-16 transition-[padding-left] duration-500 ease-in-out",
          sidebarOpen ? "pl-64" : "pl-16"
        )}
        style={{
          height: "calc(100vh - 4rem)",
          overflowY: "auto"
        }}
      >
        <Container className={isGuestUserArea ? "pt-3" : undefined}>{children}</Container>
      </main>
    </div>
  );
}
