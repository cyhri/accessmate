import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16">
      <Container size="sm" className="text-center space-y-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xl">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The requested resource could not be found or has not been unlocked in the current development phase.
          </p>
        </div>
        <div>
          <Link href="/">
            <Button variant="primary">Return to Overview</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
