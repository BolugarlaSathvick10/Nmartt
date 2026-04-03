"use client";

import { ShoppingCart, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/store";
import { useCartStore } from "@/store";

export const HEADER_HEIGHT_CLASS = "h-16";

type HeaderProps = {
	className?: string;
};

export function Header({ className }: HeaderProps) {
	const pathname = usePathname();
	const user = useAuthStore((s) => s.user);
	const cartItems = useCartStore((s) => s.items);
	const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
	const setCartOpen = useUIStore((s) => s.setCartOpen);
	const toggleSidebar = useUIStore((s) => s.toggleSidebar);

	return (
		<header
			className={cn(
				"fixed top-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 transition-all duration-500 ease-in-out",
				HEADER_HEIGHT_CLASS,
				"w-full",
				className
			)}
		>
			<div className="flex h-full w-full items-center justify-between px-6">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleSidebar}
						className="-ml-2 rounded-lg"
						aria-label="Toggle sidebar"
					>
						<Menu className="h-5 w-5" />
					</Button>
					<Logo className="text-2xl" />
				</div>

				<div className="flex items-center gap-4">
					{pathname.includes("/user") && (
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setCartOpen(true)}
								className="relative rounded-lg border border-gray-200 px-3 py-2 shadow-sm transition hover:shadow-md"
							>
								<ShoppingCart className="h-5 w-5" />
								<AnimatePresence>
									{totalItems > 0 && (
										<motion.span
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											exit={{ scale: 0 }}
											className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/90 text-xs font-bold text-white"
										>
											{totalItems}
										</motion.span>
									)}
								</AnimatePresence>
							</Button>
						</motion.div>
					)}
					<div className="text-sm text-muted-foreground">{user?.name ?? "Nmart"}</div>
				</div>
			</div>
		</header>
	);
}
