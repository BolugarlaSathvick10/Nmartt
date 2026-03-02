"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Truck,
  Settings,
  BarChart3,
  ChevronLeft,
  Menu,
  X,
  ClipboardList,
  History,
  Home,
  Boxes,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/store";

export type NavItem = { href: string; label: string; icon: React.ElementType };

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/product-analytics", label: "Product Analytics", icon: BarChart3 },
  { href: "/admin/coupons", label: "Coupons & Offers", icon: Ticket },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/delivery", label: "Delivery Boys", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const pmNav: NavItem[] = [
  { href: "/pm", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pm/products", label: "Products", icon: Package },
  { href: "/pm/categories", label: "Categories", icon: FolderTree },
  { href: "/pm/inventory", label: "Inventory", icon: Boxes },
];

const deliveryNav: NavItem[] = [
  { href: "/delivery", label: "Dashboard", icon: LayoutDashboard },
  { href: "/delivery/orders", label: "Assigned Orders", icon: ClipboardList },
  { href: "/delivery/history", label: "Delivery History", icon: History },
];

const userNav: NavItem[] = [
  { href: "/user/home", label: "Home", icon: Home },
  { href: "/user/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/user/profile", label: "Profile", icon: Users },
  { href: "/user/coupons", label: "Coupons", icon: Ticket },
  { href: "/user/support", label: "Customer Support", icon: ClipboardList },
  { href: "/user/faq", label: "FAQ", icon: ClipboardList },
  { href: "/user/terms", label: "Terms & Policies", icon: ClipboardList },
];

function getNav(path: string): NavItem[] {
  if (path.startsWith("/admin")) return adminNav;
  if (path.startsWith("/pm")) return pmNav;
  if (path.startsWith("/delivery")) return deliveryNav;
  if (path.startsWith("/user")) return userNav;
  return [];
}

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const nav = getNav(pathname);

  if (nav.length === 0) return null;

  return (
    <>
      {/* Toggle Button - Always Visible with Smooth Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "fixed top-0 left-0 z-50 h-14 flex items-center px-4",
          sidebarOpen ? "lg:w-[260px]" : "lg:w-14"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 active:scale-95"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Menu className="h-5 w-5" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -260, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-gray-100 bg-white",
          "hidden lg:flex flex-col pt-14"
        )}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 bg-white">
            <Link href={nav[0]?.href ?? "/"} className="font-bold text-green-600 text-lg">
              N-Mart
            </Link>
            <span className="text-xs text-gray-500 ml-2">({user?.role})</span>
            <div className="ml-auto hidden lg:block">
              <LanguageSwitcher />
            </div>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-3 space-y-1">
              {nav.map((item, i) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                let labelText = item.label;
                if (pathname.startsWith("/user") && item.href.startsWith("/user")) {
                  if (item.href.endsWith("/orders")) labelText = t ? t("sidebar.orders") : "My Orders";
                  else if (item.href.endsWith("/profile")) labelText = t ? t("sidebar.profile") : "Profile";
                  else if (item.href.endsWith("/coupons")) labelText = t ? t("sidebar.coupons") : "Coupons";
                  else if (item.href.endsWith("/support")) labelText = t ? t("sidebar.support") : "Customer Support";
                  else if (item.href.endsWith("/faq")) labelText = t ? t("sidebar.faq") : "FAQ";
                  else if (item.href.endsWith("/terms")) labelText = t ? t("sidebar.terms") : "Terms & Policies";
                  else if (item.href.endsWith("/home")) labelText = t ? t("sidebar.home") : "Home";
                }

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-green-50 text-green-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{labelText}</span>
                    </motion.span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
          <div className="border-t border-gray-100 flex items-center justify-between p-4 bg-gray-50">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                logout();
              }}
            >
              {t ? t("sidebar.logout") : "Logout"}
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-gray-100 bg-white lg:hidden",
          !sidebarOpen && "pointer-events-none"
        )}
      >
        <div className="flex h-full flex-col pt-14">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-white">
            <Link href={nav[0]?.href ?? "/"} className="font-bold text-green-600 text-lg">
              N-Mart
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-3 space-y-1">
              {nav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <motion.span
                      whileHover={{ x: 4 }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-green-50 text-green-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </motion.span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
          <div className="border-t border-gray-100 flex items-center justify-between p-4 bg-gray-50">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
