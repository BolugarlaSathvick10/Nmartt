import { cn } from "@/lib/utils";

type AppCardProps = {
	children: React.ReactNode;
	className?: string;
};

export function AppCard({ children, className }: AppCardProps) {
	return <section className={cn("rounded-xl border bg-card p-6 shadow-sm", className)}>{children}</section>;
}
