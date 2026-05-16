import { useEffect, useRef } from "react";

interface FormErrorProps {
  message: string | null;
}

const FormError = ({ message }: FormErrorProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message) {
      ref.current?.focus();
    }
  }, [message]);

  if (!message) return null;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="polite"
      tabIndex={-1}
      className="rounded-md bg-destructive/10 p-4 text-sm text-destructive focus-visible:ring-2 focus-visible:ring-ring"
    >
      {message}
    </div>
  );
};

export { FormError };
