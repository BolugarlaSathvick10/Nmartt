import { cn } from "@/lib/utils";

type ContainerProps = {
	children: React.ReactNode;
	className?: string;
};

export function Container({ children, className }: ContainerProps) {
	return (
		<div className={cn("w-full px-6 py-6", className)}>
			{children}
		</div>
	);
}
