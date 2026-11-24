import React from "react";
import { cn } from "@/lib/utils";
import { FormLabel } from "./form-label";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string;
  readonly helperText?: string;
  readonly error?: string;
  readonly options: readonly SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      id,
      label,
      helperText,
      error,
      required,
      options,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const helperId = helperText && selectId ? `${selectId}-helper` : undefined;
    const errorId = error && selectId ? `${selectId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <FormLabel htmlFor={selectId} required={required} helperText={helperText}>
            {label}
          </FormLabel>
        )}
        <div className="relative rounded-md shadow-2xs">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperId}
            required={required}
            className={cn(
              "block w-full appearance-none rounded-md border bg-white py-1.5 pl-3 pr-9 text-sm text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                : "border-zinc-300 focus:border-teal-700 focus:ring-teal-700/20",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-xs text-rose-600 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
