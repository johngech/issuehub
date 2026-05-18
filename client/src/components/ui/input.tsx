import { Flex, Text } from "@radix-ui/themes";
import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className,
  ...props
}: Readonly<InputProps>) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <Flex
      className={className}
      gap={"3"}
      justify={"start"}
      align={"start"}
      direction={"column"}
    >
      {label && (
        <Text as="label" htmlFor={inputId} weight="medium">
          {label}
        </Text>
      )}
      <input
        id={inputId}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          borderRadius: "var(--radius-md)",
          border: error
            ? "1px solid var(--color-red-9)"
            : "1px solid var(--color-border)",
          padding: "var(--space-md)",
          transition: "all var(--transition-fast)",
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: error ? "var(--color-red-2)" : undefined,
        }}
        {...props}
      />
      {error && (
        <Text size="1" color="red" mt="1">
          {error}
        </Text>
      )}
    </Flex>
  );
}
