import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("w-full px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6", className)}>
      {children}
    </div>
  );
}
