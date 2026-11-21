import React from "react";
import { Container } from "@/components/ui/container";

export default function Loading() {
  return (
    <div className="py-12" aria-live="polite" aria-busy="true">
      <Container size="lg" className="space-y-6">
        <div className="h-8 w-48 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-4 w-96 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
