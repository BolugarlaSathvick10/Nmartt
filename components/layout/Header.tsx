"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, Menu, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore, useUIStore } from "@/store";
import { useCartStore } from "@/store";
import { useNotificationStore } from "@/store";

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
	const [notiOpen, setNotiOpen] = useState(false);
	const readByUser = useNotificationStore((s) => s.readByUser);
	const notifications = useNotificationStore((s) => s.getNotificationsForCurrentUser());
	const unreadCount = useNotificationStore((s) => s.getUnreadCountForCurrentUser());
	const markAsRead = useNotificationStore((s) => s.markAsRead);
	const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

	const latestNotifications = useMemo(() => notifications.slice(0, 8), [notifications]);
	const readIds = user ? readByUser[user.id] ?? [] : [];

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
						<>
							<div className="relative">
								<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setNotiOpen((prev) => !prev)}
										className="relative rounded-lg border border-gray-200 px-3 py-2 shadow-sm transition hover:shadow-md"
									>
										<Bell className="h-5 w-5" />
										<AnimatePresence>
											{unreadCount > 0 && (
												<motion.span
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													exit={{ scale: 0 }}
													className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
												>
													{Math.min(unreadCount, 99)}
												</motion.span>
											)}
										</AnimatePresence>
									</Button>
								</motion.div>

								<AnimatePresence>
									{notiOpen && (
										<motion.div
											initial={{ opacity: 0, y: 8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 8 }}
											className="absolute right-0 mt-2 w-80 rounded-xl border bg-background p-3 shadow-xl"
										>
											<div className="mb-2 flex items-center justify-between">
												<p className="text-sm font-semibold">Notifications</p>
												<Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 px-2 text-xs">
													Mark all read
												</Button>
											</div>
											<div className="max-h-80 space-y-2 overflow-y-auto pr-1">
												{latestNotifications.map((notification) => {
													const isUnread = !readIds.includes(notification.id);
													return (
														<button
															key={notification.id}
															type="button"
															onClick={() => markAsRead(notification.id)}
															className={cn(
																"w-full rounded-lg border p-2 text-left transition",
																isUnread ? "border-primary/30 bg-primary/5" : "hover:bg-muted"
															)}
														>
															<p className="text-sm font-medium">{notification.title}</p>
															<p className="mt-1 text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
															<p className="mt-1 text-[10px] uppercase text-muted-foreground">
																{notification.type} | {new Date(notification.createdAt).toLocaleString()}
															</p>
														</button>
													);
												})}
												{latestNotifications.length === 0 && (
													<p className="text-xs text-muted-foreground">No notifications yet.</p>
												)}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

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
						</>
					)}
					<div className="text-sm text-muted-foreground">{user?.name ?? "Nmart"}</div>
				</div>
			</div>
		</header>
	);
}
