"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ACCESSMATE Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <h2 className="text-base font-semibold text-zinc-900 mb-2">An error occurred</h2>
      <p className="text-xs sm:text-sm text-zinc-500 mb-6 max-w-md">
        An unexpected error occurred while processing the accessibility data.
      </p>
      <Button onClick={reset} variant="primary" size="md">
        Try Again
      </Button>
    </div>
  );
}
