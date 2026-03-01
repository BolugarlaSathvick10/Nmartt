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
  ChevronLeft,
  Menu,
  X,
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
          "fixed left-0 top-0 z-40 h-screen w-[260px] border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
          "hidden lg:flex flex-col pt-14"
        )}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <Link href={nav[0]?.href ?? "/"} className="font-semibold gradient-text text-lg">
              N-Mart
            </Link>
            <span className="text-xs text-muted-foreground ml-1">({user?.role})</span>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-3">
              {nav.map((item, i) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1",
                        isActive
                          ? "bg-primary/15 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-accent/50"
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
          <Separator />
          <div className="flex items-center justify-between p-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:text-destructive"
              onClick={() => logout()}
            >
              Logout
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
          "fixed left-0 top-0 z-40 h-screen w-[260px] border-r bg-card/98 backdrop-blur lg:hidden",
          !sidebarOpen && "pointer-events-none"
        )}
      >
        <div className="flex h-full flex-col pt-14">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Link href={nav[0]?.href ?? "/"} className="font-semibold gradient-text text-lg">
              N-Mart
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8 hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="grid gap-1 px-3">
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
                          ? "bg-primary/15 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-accent/50"
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
          <Separator />
          <div className="flex items-center justify-between p-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:text-destructive"
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
