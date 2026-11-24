import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "navy" | "secondary" | "outline" | "ghost" | "mint";
  readonly size?: "sm" | "md" | "lg";
  readonly isLoading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-md cursor-pointer select-none";

    const variantStyles = {
      primary:
        "bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 shadow-2xs focus-visible:ring-teal-700 focus-visible:ring-offset-zinc-50",
      navy:
        "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 shadow-2xs focus-visible:ring-zinc-900 focus-visible:ring-offset-zinc-50",
      secondary:
        "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:bg-zinc-300 focus-visible:ring-zinc-400 focus-visible:ring-offset-zinc-50",
      outline:
        "border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 active:bg-zinc-100 focus-visible:ring-teal-700 focus-visible:ring-offset-zinc-50 shadow-2xs",
      ghost:
        "bg-transparent hover:bg-zinc-100 text-zinc-700 active:bg-zinc-200 focus-visible:ring-teal-700",
      mint:
        "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 active:bg-teal-200/80 focus-visible:ring-teal-700",
    }[variant];

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-10 px-5 text-base gap-2.5",
    }[size];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
