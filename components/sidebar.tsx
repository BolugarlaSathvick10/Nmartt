"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Truck,
  Settings,
  ChevronLeft,
  Menu,
  ClipboardList,
  History,
  Home,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";
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
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const nav = getNav(pathname);

  if (nav.length === 0) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-[260px] border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
          "hidden lg:flex flex-col"
        )}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <Link href={nav[0]?.href ?? "/"} className="font-semibold gradient-text text-lg">
              N-Mart
            </Link>
            <span className="text-xs text-muted-foreground ml-1">({user?.role})</span>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-3">
              {nav.map((item, i) => {
                const isActive = pathname === item.href || (item.href !== `/${pathname.split("/")[1]}` && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </motion.span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
          <Separator />
          <div className="flex items-center justify-between p-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </aside>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-0 z-40 h-screen w-[260px] border-r bg-card lg:hidden"
      >
        <div className="flex h-full flex-col pt-14">
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-3">
              {nav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                    <span
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
          <div className="flex items-center justify-between p-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
