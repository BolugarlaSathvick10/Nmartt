"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";

function getRequiredRole(path: string): string | null {
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/pm")) return "pm";
  if (path.startsWith("/delivery")) return "delivery";
  if (path.startsWith("/user")) return "user";
  return null;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    const required = getRequiredRole(pathname);
    if (required && user.role !== required) {
      const home = required === "admin" ? "/admin" : required === "pm" ? "/pm" : required === "delivery" ? "/delivery" : "/user/home";
      router.replace(home);
    }
  }, [pathname, user, isAuthenticated, router]);

  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main
        className={cn(
          "flex-1 bg-gray-50 min-h-screen transition-[padding] duration-300",
          sidebarOpen ? "lg:pl-[260px]" : "lg:pl-14"
        )}
      >
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
