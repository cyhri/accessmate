/**
 * Utility Functions
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

/**
 * Combines conditional CSS classes cleanly without requiring external heavy dependencies.
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    .join(" ");
}

/**
 * Formats an ISO date string into a localized, accessible date.
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString;
    }
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}
