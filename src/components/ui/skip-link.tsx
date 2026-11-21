import React from "react";
import { cn } from "@/lib/utils";

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly targetId?: string;
}

/**
 * Accessible Skip Link allowing keyboard and screen-reader users to bypass repetitive header navigation.
 */
export function SkipLink({
  targetId = "main-content",
  className,
  children = "Skip to main content",
  ...props
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-transform",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
