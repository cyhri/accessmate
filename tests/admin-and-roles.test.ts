import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { authService, verifySessionToken } from "../src/features/auth/auth-service";
import { checkHazardProximity } from "../src/features/reports/hazard-alert-engine";
import type { CommunityReport } from "../src/features/reports/types";
import type { GeoCoordinates } from "../src/types/common";

describe("ACCESSMATE — RBAC, Auth Security & Safety Tests", () => {
  test("seed accounts exist and authenticate properly", () => {
    // Admin login
    const adminSession = authService.login("admin@accessmate.org", "Admin123!");
    assert.ok(adminSession, "Admin session should be created");
    assert.equal(adminSession.user.role, "admin");
    assert.ok(adminSession.token.length > 20);

    // Standard user login
    const userSession = authService.login("user@accessmate.org", "User123!");
    assert.ok(userSession, "User session should be created");
    assert.equal(userSession.user.role, "user");
  });

  test("session token cryptographic signature verification and tamper detection", () => {
    const session = authService.login("admin@accessmate.org", "Admin123!");
    assert.ok(session);

    // Valid token verifies
    const verified = verifySessionToken(session.token);
    assert.ok(verified, "Session should be verified");
    assert.equal(verified.email, "admin@accessmate.org");
    assert.equal(verified.role, "admin");

    // Tampered token (modified payload) fails verification
    const parts = session.token.split(".");
    assert.equal(parts.length, 2, "Token should be payload.signature");

    const tamperedPayload = Buffer.from(
      JSON.stringify({
        sub: "user-standard-002",
        email: "user@accessmate.org",
        role: "admin", // attempt privilege escalation
        exp: Date.now() + 100000,
      })
    ).toString("base64url");

    const forgedToken = `${tamperedPayload}.${parts[1]}`;
    const forgedResult = verifySessionToken(forgedToken);
    assert.equal(forgedResult, null, "Forged token with wrong signature must fail verification");
  });

  test("role management and sole-admin protection", () => {
    const users = authService.getAllUsers();
    const adminUser = users.find((u) => u.role === "admin");
    const standardUser = users.find((u) => u.role === "user");
    assert.ok(adminUser);
    assert.ok(standardUser);

    // Standard user cannot update roles (requires admin privileges)
    const unauthorizedAttempt = authService.updateUserRole(standardUser.id, standardUser.id, "admin");
    assert.equal(unauthorizedAttempt.success, false);
    assert.ok(unauthorizedAttempt.error?.includes("Administrator privileges required"));

    // Admin promotes standard user to admin
    const promoteResult = authService.updateUserRole(adminUser.id, standardUser.id, "admin");
    assert.equal(promoteResult.success, true);
    assert.equal(promoteResult.user?.role, "admin");

    // Admin demotes user back to standard user
    const demoteResult = authService.updateUserRole(adminUser.id, standardUser.id, "user");
    assert.equal(demoteResult.success, true);
    assert.equal(demoteResult.user?.role, "user");

    // Prevent demoting the only remaining platform administrator
    const currentAdmins = authService.getAllUsers().filter((u) => u.role === "admin");
    if (currentAdmins.length === 1) {
      const soleAdminAttempt = authService.updateUserRole(adminUser.id, adminUser.id, "user");
      assert.equal(soleAdminAttempt.success, false);
      assert.ok(soleAdminAttempt.error?.includes("Cannot revoke admin status from the only remaining administrator"));
    }
  });

  test("directional corridor hazard detection filters hazards behind and off-route", () => {
    // Pedestrian heading North from lat 52.5165 to 52.5200 along lng 13.3777
    const userPos: GeoCoordinates = { latitude: 52.5165, longitude: 13.3777 };
    const routeCoords: GeoCoordinates[] = [
      { latitude: 52.5160, longitude: 13.3777 },
      { latitude: 52.5165, longitude: 13.3777 },
      { latitude: 52.5200, longitude: 13.3777 },
    ];

    const testReports: CommunityReport[] = [
      {
        id: "rep-ahead-1",
        title: "Construction Ahead",
        details: "Sidewalk closed for utility maintenance",
        status: "active",
        location: "Ebertstrasse",
        coordinates: { latitude: 52.5170, longitude: 13.3777 }, // ~55m ahead (North)
        category: "construction",
        severity: "critical",
        createdAt: "2026-11-24T12:00:00Z",
        timeAgo: "10m ago",
        confirmationCount: 3,
        confirmedByUserIds: ["user-1"],
        moderationStatus: "verified",
        routeImpact: "Pathway blocked",
      },
      {
        id: "rep-behind-2",
        title: "Obstacle Behind",
        details: "Cobblestone and missing curb ramp",
        status: "active",
        location: "Ebertstrasse South",
        coordinates: { latitude: 52.5160, longitude: 13.3777 }, // ~55m behind (South)
        category: "surface",
        severity: "critical",
        createdAt: "2026-11-24T12:00:00Z",
        timeAgo: "20m ago",
        confirmationCount: 2,
        confirmedByUserIds: [],
        moderationStatus: "verified",
        routeImpact: "Uneven surface",
      },
      {
        id: "rep-far-off-3",
        title: "Off-route Obstacle",
        details: "Elevator out of service on parallel street",
        status: "active",
        location: "Friedrichstrasse",
        coordinates: { latitude: 52.5168, longitude: 13.3900 }, // ~800m East, off corridor
        category: "elevator",
        severity: "critical",
        createdAt: "2026-11-24T12:00:00Z",
        timeAgo: "1h ago",
        confirmationCount: 1,
        confirmedByUserIds: [],
        moderationStatus: "verified",
        routeImpact: "Elevator out",
      },
      {
        id: "rep-resolved-4",
        title: "Fixed Ramp Ahead",
        details: "Permanent concrete ramp completed",
        status: "resolved",
        location: "Ebertstrasse North",
        coordinates: { latitude: 52.5172, longitude: 13.3777 }, // ahead, but resolved
        category: "curb_ramp",
        severity: "resolved",
        createdAt: "2026-11-24T12:00:00Z",
        timeAgo: "2h ago",
        confirmationCount: 5,
        confirmedByUserIds: [],
        moderationStatus: "resolved",
        routeImpact: "Ramp installed",
      },
    ];

    const alert = checkHazardProximity(
      userPos,
      testReports,
      100, // 100m radius
      {},
      0,
      routeCoords
    );

    assert.ok(alert, "An alert should be generated for the hazard directly ahead");
    assert.equal(alert.report.id, "rep-ahead-1");
    assert.equal(alert.isDirectlyAhead, true);
    assert.ok(alert.distanceMeters > 30 && alert.distanceMeters < 80);
  });
});
