import React from "react";
import { CheckCircle2, Users, AlertTriangle, HelpCircle, MinusCircle } from "lucide-react";
import type { EvidenceStatus } from "@/constants";
import { Badge } from "@/components/ui/badge";

export interface EvidenceBadgeProps {
  readonly status: EvidenceStatus;
  readonly size?: "sm" | "md";
  readonly showIcon?: boolean;
}

export function EvidenceBadge({ status, size = "sm", showIcon = true }: EvidenceBadgeProps) {
  const config = {
    verified: {
      label: "Verified Audit",
      variant: "success" as const,
      icon: <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />,
    },
    user_reported: {
      label: "User Reported",
      variant: "teal" as const,
      icon: <Users className="h-3 w-3 shrink-0" aria-hidden="true" />,
    },
    unverified: {
      label: "Unverified Claim",
      variant: "warning" as const,
      icon: <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />,
    },
    unknown: {
      label: "Not Surveyed / Unknown",
      variant: "neutral" as const,
      icon: <HelpCircle className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />,
    },
    not_applicable: {
      label: "Not Applicable",
      variant: "outline" as const,
      icon: <MinusCircle className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />,
    },
  }[status] ?? {
    label: status,
    variant: "neutral" as const,
    icon: <HelpCircle className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />,
  };

  return (
    <Badge variant={config.variant} size={size}>
      {showIcon && config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
