/**
 * Feature Module: Route & Spatial Decision Support (Phase 5 Active)
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

export * from "./types.ts";
export * from "./ors-client.ts";
export * from "./demo-routes.ts";
export * from "./rules/route-rules.ts";
export { RouteInferenceEngine } from "./engine/route-inference-engine.ts";
export { LocationSearch } from "./components/location-search.tsx";
export { RouteDetailsPanel } from "./components/route-details-panel.tsx";
export { default as RouteMapLibre } from "./components/route-maplibre.tsx";
export * from "./engine/navigation-tracker.ts";

export const ROUTING_FEATURE_VERSION = "0.5.0";
