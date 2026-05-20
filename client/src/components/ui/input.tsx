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
        className="w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          borderColor: error ? "var(--color-red-9)" : "var(--gray-5)",
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
