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

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "pt-4 pb-8 px-4 pl-14 transition-[padding]",
          sidebarOpen ? "lg:pl-[260px]" : "lg:pl-14"
        )}
      >
        {children}
      </main>
    </div>
  );
}
