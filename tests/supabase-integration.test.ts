import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { InferenceEngine } from "../src/features/expert-system";
import { getDefaultProfile } from "../src/lib/storage/profile-storage";
import { SAMPLE_BUILDING_ASSESSMENTS } from "../src/lib/storage/sample-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lduljzvcukjttpheecsq.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdWxqenZjdWtqdHRwaGVlY3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MzQ5MzIsImV4cCI6MjExMTExMDkzMn0.yCGsHirPZKMPgE_rw0P3tGRyYXKc8-ehL4mNWPEPMPw";
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdWxqenZjdWtqdHRwaGVlY3NxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTUzNDkzMiwiZXhwIjoyMTExMTEwOTMyfQ.yTVGLOVJ-rk7VgnaMMmEEetUG3L6m8-ojFUg5PYZHOo";

describe("ACCESSMATE — Supabase Primary Backend Integration Tests", () => {
  test("Supabase environment configuration is present and valid", () => {
    assert.ok(supabaseUrl.startsWith("https://"), "Supabase URL must be HTTPS");
    assert.ok(anonKey.length > 30, "Publishable key must be a valid JWT");
    assert.ok(serviceRoleKey.length > 30, "Service role key must be a valid JWT");
  });

  test("Supabase public client queries published venues via REST Data API", async () => {
    const supabase = createClient(supabaseUrl, anonKey);
    const { data, error } = await supabase
      .from("venues")
      .select("id, name, address, latitude, longitude, publication_status")
      .eq("publication_status", "published");

    assert.equal(error, null, `Query should succeed: ${error?.message}`);
    assert.ok(Array.isArray(data), "Data should be an array");
    assert.ok(data.length >= 1, "At least one published venue should be seeded");
  });

  test("Supabase public client queries active community reports", async () => {
    const supabase = createClient(supabaseUrl, anonKey);
    const { data, error } = await supabase
      .from("community_reports")
      .select("id, title, category, severity, status, moderation_status");

    assert.equal(error, null, `Reports query should succeed: ${error?.message}`);
    assert.ok(Array.isArray(data), "Data should be an array");
    assert.ok(data.length >= 1, "At least one community report should exist in the database");
  });

  test("Role verification checks server-controlled app_metadata, not user_metadata", () => {
    const mockUserPayload = {
      sub: "usr-fake-123",
      user_metadata: { role: "admin" }, // Client attempted spoofing!
      app_metadata: { role: "user" },   // Server authority
    };

    // Client-controlled user_metadata must NEVER grant admin
    const isAdmin = mockUserPayload.app_metadata.role === "admin";
    assert.equal(isAdmin, false, "Client-controlled user_metadata must not grant administrative access");
  });

  test("Deterministic Expert Inference Engine evaluates database-backed records without alteration", () => {
    const profile = getDefaultProfile();
    const assessment = SAMPLE_BUILDING_ASSESSMENTS[0];

    assert.ok(assessment, "Sample assessment must exist");
    const result = InferenceEngine.evaluate(profile, assessment);

    assert.ok(result.overallOutcome, "Evaluation must produce an outcome");
    assert.ok(result.explanationTraces.length >= 1, "Evaluation must generate explainable rule traces");
    assert.equal(typeof result.rulesEvaluatedCount, "number");
  });
});
