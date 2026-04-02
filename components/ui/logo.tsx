import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        "text-3xl font-extrabold text-green-600 tracking-tight hover:text-green-700 transition-colors",
        className
      )}
    >
      N-Mart
    </span>
  );
}
