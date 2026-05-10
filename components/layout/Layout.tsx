"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import GuestBanner from "@/components/guest/GuestBanner";
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
	const requiredRole = getRequiredRole(pathname);

	useEffect(() => {
		if (!hasHydrated) return;

		if (requiredRole && !isAuthenticated) {
			router.replace("/login");
			return;
		}

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

	return (
		<div className="min-h-screen bg-muted/20">
			<Sidebar />
			<Header />
			{pathname.startsWith("/user") && !isAuthenticated && <GuestBanner />}
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
				<Container>{children}</Container>
			</main>
		</div>
	);
}
