"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Truck, Settings, BarChart3, ClipboardList, History, Home, Boxes, Ticket, LogOut, HelpCircle, FileText, LifeBuoy, Menu, BellRing } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/store";
import { useTranslations } from "next-intl";

export const SIDEBAR_EXPANDED_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ElementType;
};

const adminNav: NavItem[] = [
  { href: "/admin", labelKey: "sidebar.dashboard", icon: LayoutDashboard },
  { href: "/admin/products", labelKey: "sidebar.products", icon: Package },
  { href: "/admin/categories", labelKey: "sidebar.categories", icon: FolderTree },
  { href: "/admin/product-analytics", labelKey: "sidebar.productAnalytics", icon: BarChart3 },
  { href: "/admin/audit", labelKey: "sidebar.audit", icon: ClipboardList },
  { href: "/admin/coupons", labelKey: "sidebar.coupons", icon: Ticket },
  { href: "/admin/notification-pusher", labelKey: "sidebar.notificationPusher", icon: BellRing },
  { href: "/admin/orders", labelKey: "sidebar.orders", icon: ShoppingCart },
  { href: "/admin/payments", labelKey: "sidebar.payments", icon: History },
  { href: "/admin/users", labelKey: "sidebar.users", icon: Users },
  { href: "/admin/delivery", labelKey: "sidebar.delivery", icon: Truck },
  { href: "/admin/settings", labelKey: "sidebar.settings", icon: Settings },
];

const pmNav: NavItem[] = [
  { href: "/pm", labelKey: "sidebar.dashboard", icon: LayoutDashboard },
  { href: "/pm/products", labelKey: "sidebar.products", icon: Package },
  { href: "/pm/categories", labelKey: "sidebar.categories", icon: FolderTree },
  { href: "/pm/inventory", labelKey: "sidebar.inventory", icon: Boxes },
];

const deliveryNav: NavItem[] = [
  { href: "/delivery", labelKey: "sidebar.dashboard", icon: LayoutDashboard },
  { href: "/delivery/orders", labelKey: "sidebar.assignedOrders", icon: ClipboardList },
  { href: "/delivery/history", labelKey: "sidebar.deliveryHistory", icon: History },
];

const userNav: NavItem[] = [
  { href: "/user/home", labelKey: "sidebar.home", icon: Home },
  { href: "/user/orders", labelKey: "sidebar.myOrders", icon: ShoppingCart },
  { href: "/user/profile", labelKey: "sidebar.profile", icon: Users },
  { href: "/user/coupons", labelKey: "sidebar.coupons", icon: Ticket },
  { href: "/user/support", labelKey: "sidebar.support", icon: LifeBuoy },
  { href: "/user/faq", labelKey: "sidebar.faq", icon: HelpCircle },
  { href: "/user/terms", labelKey: "sidebar.terms", icon: FileText },
];

function getNav(pathname: string) {
  if (pathname.startsWith("/admin")) return adminNav;
  if (pathname.startsWith("/pm")) return pmNav;
  if (pathname.startsWith("/delivery")) return deliveryNav;
  if (pathname.startsWith("/user")) return userNav;
  return [];
}

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const logout = useAuthStore((s) => s.logout);

  const nav = getNav(pathname);
  if (nav.length === 0) return null;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r bg-background transition-[width] duration-500 ease-in-out",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-16 items-center justify-start border-b px-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground",
            sidebarOpen ? "-ml-1" : "-ml-2"
          )}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap text-base font-semibold leading-none text-foreground transition-[max-width,opacity,transform] duration-300 ease-in-out",
              sidebarOpen ? "ml-2 max-w-24 translate-x-0 opacity-100" : "max-w-0 -translate-x-2 opacity-0"
            )}
          >
            Nmart
          </span>
        </button>
      </div>

      <ScrollArea className={cn("flex-1 py-4", sidebarOpen ? "px-3" : "px-2")}>
        <nav className="grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={sidebarOpen ? undefined : t(item.labelKey)}
                className={cn(
                  "rounded-lg py-2.5 text-sm font-medium transition-colors duration-200",
                  "flex items-center gap-3 px-3",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-in-out",
                    sidebarOpen ? "max-w-40 translate-x-0 opacity-100" : "max-w-0 -translate-x-2 opacity-0"
                  )}
                >
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className={cn("border-t py-3", sidebarOpen ? "px-4" : "px-2")}>
        <div className={cn("flex items-center", sidebarOpen ? "justify-between gap-2" : "justify-start") }>
          {sidebarOpen && <LanguageSwitcher />}
          <div className={cn("flex items-center gap-2", !sidebarOpen && "flex-col") }>
            <Button variant="ghost" size={sidebarOpen ? "sm" : "icon"} onClick={logout}>
              {!sidebarOpen && <LogOut className="h-4 w-4" />}
              {sidebarOpen ? t("sidebar.logout") : null}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
