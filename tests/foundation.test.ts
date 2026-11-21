import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { siteConfig } from "../src/config/site.ts";
import {
  ACCESSIBILITY_DIMENSIONS,
  EVIDENCE_LEVELS,
  COMPATIBILITY_STATUSES,
  BARRIER_SEVERITIES,
  PROJECT_PHASES,
} from "../src/constants/index.ts";
import { cn, formatDate } from "../src/lib/utils.ts";

describe("ACCESSMATE Test Suite — Baseline & Phase 3 Roadmap Verification", () => {
  test("siteConfig contains required project metadata and Phase 3 routes", () => {
    assert.equal(siteConfig.name, "ACCESSMATE");
    assert.equal(siteConfig.version, "0.3.0");
    assert.ok(siteConfig.tagLine.includes("Decision-Support"));
    assert.ok(siteConfig.description.length > 20);
    assert.equal(siteConfig.mainNav.length, 6);

    const routes = siteConfig.mainNav.map((item) => item.href);
    assert.ok(routes.includes("/"));
    assert.ok(routes.includes("/profile"));
    assert.ok(routes.includes("/routes"));
    assert.ok(routes.includes("/assessment"));
    assert.ok(routes.includes("/reports"));
    assert.ok(routes.includes("/settings"));
  });

  test("domain constants enforce required accessibility dimensions", () => {
    assert.ok(ACCESSIBILITY_DIMENSIONS.includes("mobility"));
    assert.ok(ACCESSIBILITY_DIMENSIONS.includes("vision"));
    assert.ok(ACCESSIBILITY_DIMENSIONS.includes("hearing"));
    assert.ok(ACCESSIBILITY_DIMENSIONS.includes("sensory_cognitive"));
    assert.ok(ACCESSIBILITY_DIMENSIONS.includes("stamina_endurance"));
  });

  test("evidence levels and compatibility statuses are correctly defined", () => {
    assert.equal(EVIDENCE_LEVELS.VERIFIED_AUDIT, "verified_audit");
    assert.equal(COMPATIBILITY_STATUSES.COMPATIBLE, "compatible");
    assert.equal(COMPATIBILITY_STATUSES.INCOMPATIBLE, "incompatible");
    assert.equal(BARRIER_SEVERITIES.CRITICAL, "critical");
  });

  test("roadmap phases define Phase 1 and 2 as completed and Phase 3 as active", () => {
    const phase1 = PROJECT_PHASES.find((p) => p.phase === 1);
    assert.ok(phase1, "Phase 1 must exist");
    assert.equal(phase1?.status, "completed");

    const phase2 = PROJECT_PHASES.find((p) => p.phase === 2);
    assert.ok(phase2, "Phase 2 must exist");
    assert.equal(phase2?.status, "completed");

    const phase3 = PROJECT_PHASES.find((p) => p.phase === 3);
    assert.ok(phase3, "Phase 3 must exist");
    assert.equal(phase3?.status, "active");
  });

  test("cn utility cleanly combines class names and handles falsy values", () => {
    const combined = cn("btn", true && "btn-primary", false && "btn-secondary", undefined, null, "px-4");
    assert.equal(combined, "btn btn-primary px-4");
  });

  test("formatDate handles valid ISO dates and bad dates gracefully", () => {
    const valid = formatDate("2026-11-21T12:00:00Z");
    assert.ok(valid.length > 5);

    const invalid = formatDate("not-a-valid-date");
    assert.equal(invalid, "not-a-valid-date");
  });
});
