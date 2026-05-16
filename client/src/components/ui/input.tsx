import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from "react";
import { mergeClassName } from "#/lib/merge-class-name";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  size?: "lg" | "md" | "sm" | "xs";
  bordered?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label?: string;
  errorText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant,
      size = "md",
      bordered = true,
      leftIcon,
      rightIcon,
      label,
      id,
      errorText,
      className,
      type,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    const wrapperClasses = mergeClassName(
      "flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm focus-within:border-ring",
      !bordered && "border-transparent",
      errorText ? "border-destructive" : "border-input",
      className,
    );

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium leading-none text-foreground"
          >
            {label}
          </label>
        )}

        <div className={wrapperClasses}>
          {leftIcon && <span className="shrink-0 opacity-70">{leftIcon}</span>}

          <input
            id={inputId}
            ref={ref}
            type={type}
            aria-invalid={!!errorText}
            aria-describedby={errorText ? errorId : undefined}
            className="w-full bg-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />

          {rightIcon && (
            <span className="shrink-0 opacity-70">{rightIcon}</span>
          )}
        </div>

        {errorText && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-sm text-destructive"
          >
            {errorText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
