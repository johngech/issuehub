import { Text } from "@radix-ui/themes";
import type { LabelHTMLAttributes, ReactNode } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export function Label({ children, className }: LabelProps) {
  return (
    <Text as="label" className={className}>
      {children}
    </Text>
  );
}
