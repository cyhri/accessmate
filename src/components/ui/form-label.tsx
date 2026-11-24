import React from "react";
import { cn } from "@/lib/utils";

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  readonly required?: boolean;
  readonly helperText?: string;
}

export function FormLabel({
  className,
  required = false,
  helperText,
  children,
  ...props
}: FormLabelProps) {
  return (
    <div className="flex flex-col space-y-0.5 mb-1.5">
      <label
        className={cn(
          "text-xs font-semibold text-zinc-700 select-none",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-rose-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {helperText && (
        <span className="text-[11px] text-zinc-500 leading-normal">{helperText}</span>
      )}
    </div>
  );
}
