import { Button as RadixButton } from "@radix-ui/themes";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "classic" | "solid" | "soft" | "outline" | "ghost" | "surface";
  size?: "1" | "2" | "3" | "4";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  className,
  variant = "solid",
  size = "2",
  loading = false,
  disabled,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <RadixButton
      variant={variant}
      size={size}
      className={className}
      disabled={isDisabled}
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        letterSpacing: "0.01em",
        borderRadius: "var(--radius-md)",
        transition: "all var(--transition-fast)",
      }}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </RadixButton>
  );
}
