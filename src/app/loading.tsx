import React from "react";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-4 py-8">
      <span className="sr-only">Loading accessibility data...</span>
      <div className="h-7 w-48 rounded-md bg-zinc-200 animate-pulse" />
      <div className="h-4 w-96 rounded-md bg-zinc-100 animate-pulse" />
      <div className="h-4 w-72 rounded-md bg-zinc-100 animate-pulse" />
    </div>
  );
}
