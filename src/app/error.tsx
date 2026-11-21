"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error to console for debugging
    console.error("ACCESSMATE application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <Container size="sm" className="space-y-6">
        <Alert variant="error">
          <AlertTitle>Application Error</AlertTitle>
          <AlertDescription>
            An unexpected error occurred while rendering this view.
            {error.digest && (
              <span className="block mt-1 font-mono text-xs opacity-75">
                Digest: {error.digest}
              </span>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline">
              Return Home
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
