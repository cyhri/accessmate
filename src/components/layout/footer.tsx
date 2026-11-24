import React from "react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/80 bg-white py-6 mt-auto">
      <Container size="lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p className="leading-relaxed text-center sm:text-left">
            <span className="font-semibold text-zinc-700">{siteConfig.name}</span> — Informational decision-support tool. Always verify on-site conditions when traveling.
          </p>
          <p className="shrink-0 text-zinc-400 font-medium">
            &copy; {siteConfig.year} {siteConfig.name}
          </p>
        </div>
      </Container>
    </footer>
  );
}
