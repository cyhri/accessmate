import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <p className="text-xs font-mono font-medium text-zinc-400 mb-1">404</p>
      <h2 className="text-base font-semibold text-zinc-900 mb-2">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-zinc-500 mb-6">
        The requested accessibility module or resource does not exist.
      </p>
      <Link href="/">
        <Button variant="primary" size="md">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
