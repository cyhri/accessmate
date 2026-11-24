/**
 * 3D Architectural Extruded Buildings Layer (Snapchat Map & Apple Maps Style)
 * ACCESSMATE: Personalized Accessibility & Mobility Decision-Support System
 */

import L from "leaflet";

export interface Building3DDefinition {
  readonly id: string;
  readonly name: string;
  readonly base: readonly [number, number][];
  readonly heightMeters: number;
  readonly type: "transport" | "government" | "culture" | "commercial";
  readonly details?: string;
}

export const LANDMARK_3D_BUILDINGS: readonly Building3DDefinition[] = [
  // 1. Berlin Central Railway Station (Hauptbahnhof) - Massive glass & twin towers
  {
    id: "hbf-main",
    name: "Berlin Central Station (Hauptbahnhof)",
    base: [
      [52.5262, 13.3682],
      [52.5262, 13.3712],
      [52.5248, 13.3712],
      [52.5248, 13.3682],
    ],
    heightMeters: 46,
    type: "transport",
    details: "Step-free street access from Europaplatz & Washingtonplatz. 14 high-capacity elevators.",
  },
  // 2. Washingtonplatz Cube / Southern Office Blocks
  {
    id: "cube-berlin",
    name: "Cube Berlin & Commercial Plaza",
    base: [
      [52.5242, 13.3685],
      [52.5242, 13.3702],
      [52.5234, 13.3702],
      [52.5234, 13.3685],
    ],
    heightMeters: 42,
    type: "commercial",
    details: "Smooth granite plazas with step-free tactile pathways.",
  },
  // 3. Federal Chancellery (Bundeskanzleramt)
  {
    id: "bundeskanzleramt",
    name: "Federal Chancellery (Bundeskanzleramt)",
    base: [
      [52.5208, 13.3678],
      [52.5208, 13.3704],
      [52.5194, 13.3704],
      [52.5194, 13.3678],
    ],
    heightMeters: 38,
    type: "government",
    details: "Universal step-free diplomatic entry. Security screening with ramp access.",
  },
  // 4. Paul-Löbe-Haus (Parliamentary Complex)
  {
    id: "paul-loebe-haus",
    name: "Paul-Löbe-Haus Parliamentary Offices",
    base: [
      [52.5204, 13.3722],
      [52.5204, 13.3752],
      [52.5193, 13.3752],
      [52.5193, 13.3722],
    ],
    heightMeters: 32,
    type: "government",
    details: "Wide glass automated doors (98cm clear width). High-contrast guidance.",
  },
  // 5. Reichstag Building & Historic Dome
  {
    id: "reichstag-dome",
    name: "Reichstag Building & Bundestag Dome",
    base: [
      [52.5192, 13.3752],
      [52.5192, 13.3780],
      [52.5178, 13.3780],
      [52.5178, 13.3752],
    ],
    heightMeters: 54,
    type: "government",
    details: "Barrier-free elevator to glass roof terrace. Spiral ramps at 8% incline with resting platforms.",
  },
  // 6. Kulturforum Public Library (Staatsbibliothek zu Berlin)
  {
    id: "staatsbibliothek",
    name: "City Public Library (Staatsbibliothek)",
    base: [
      [52.5085, 13.3695],
      [52.5085, 13.3724],
      [52.5065, 13.3724],
      [52.5065, 13.3695],
    ],
    heightMeters: 36,
    type: "culture",
    details: "Primary entrance equipped with tactile guide strips, automatic doors, and audio loop.",
  },
  // 7. Philharmonie Berlin (Golden Concert Hall)
  {
    id: "philharmonie",
    name: "Philharmonie Berlin",
    base: [
      [52.5108, 13.3688],
      [52.5108, 13.3712],
      [52.5094, 13.3712],
      [52.5094, 13.3688],
    ],
    heightMeters: 40,
    type: "culture",
    details: "Ramp accessible foyer with dedicated wheelchair seating boxes.",
  },
  // 8. Tiergarten West Quarter Blocks
  {
    id: "tiergarten-block-a",
    name: "Tiergarten Urban Quarter A",
    base: [
      [52.5120, 13.3665],
      [52.5120, 13.3682],
      [52.5110, 13.3682],
      [52.5110, 13.3665],
    ],
    heightMeters: 28,
    type: "commercial",
    details: "Ground-floor accessible facilities and step-free restaurant terraces.",
  },
  // 9. Kemperplatz Tech & Commercial Center
  {
    id: "kemperplatz-tower",
    name: "Sony Center & Kemperplatz Complex",
    base: [
      [52.5112, 13.3725],
      [52.5112, 13.3748],
      [52.5098, 13.3748],
      [52.5098, 13.3725],
    ],
    heightMeters: 48,
    type: "commercial",
    details: "Accessible internal arcade with multi-level elevator cores.",
  },
];

/**
 * Procedural generation has been removed.
 * Buildings must only come from verified geographic footprints.
 */
export function generateProceduralRouteBuildings(
  ..._args: unknown[]
): Building3DDefinition[] {
  void _args;
  return [];
}

/**
 * Draws true 3D extruded architectural blocks with ground shadows,
 * directional wall lighting, and elevated roofs into a Leaflet layer group.
 */
export function draw3DBuildingsLayer(
  layerGroup: L.LayerGroup,
  buildings: readonly Building3DDefinition[],
  is3DMode: boolean
): void {
  // Projection vector for 3D extrusion (shifts roofs up and slightly east toward sunlight)
  const extrusionScale = is3DMode ? 0.000007 : 0.0000035;

  buildings.forEach((bldg) => {
    const heightOffsetLat = bldg.heightMeters * extrusionScale;
    const heightOffsetLng = bldg.heightMeters * (extrusionScale * 0.35);

    const baseCoords = bldg.base.map((pt) => [pt[0], pt[1]] as [number, number]);
    const roofCoords = bldg.base.map((pt) => [
      pt[0] + heightOffsetLat,
      pt[1] + heightOffsetLng,
    ] as [number, number]);

    // 1. Ground Drop Shadow (Soft ambient occlusion behind the building)
    const shadowPolygon = L.polygon(baseCoords, {
      color: "transparent",
      fillColor: "#0f172a",
      fillOpacity: is3DMode ? 0.25 : 0.12,
      interactive: false,
    });
    layerGroup.addLayer(shadowPolygon);

    // 2. Vertical 3D Extruded Walls with Directional Lighting
    for (let j = 0; j < baseCoords.length; j++) {
      const nextIdx = (j + 1) % baseCoords.length;
      const b1 = baseCoords[j];
      const b2 = baseCoords[nextIdx];
      const r1 = roofCoords[j];
      const r2 = roofCoords[nextIdx];
      if (!b1 || !b2 || !r1 || !r2) continue;

      // Wall quad polygon
      const wallCoords: [number, number][] = [b1, b2, r2, r1];

      // Sun angle shading: South/West walls receive more light than North/East
      const wallNormal = (b2[1] - b1[1]) * 100;
      const isLitWall = wallNormal > 0;

      const wallColor = isLitWall ? "#64748b" : "#334155";
      const wallFill = isLitWall ? "#94a3b8" : "#475569";
      const wallOpacity = is3DMode ? 0.88 : 0.65;

      const wallPolygon = L.polygon(wallCoords, {
        color: wallColor,
        weight: 0.75,
        fillColor: wallFill,
        fillOpacity: wallOpacity,
        interactive: false,
      });
      layerGroup.addLayer(wallPolygon);
    }

    // 3. Elevated 3D Roof Surface
    const roofFill =
      bldg.type === "transport"
        ? "#e2e8f0"
        : bldg.type === "culture"
        ? "#fed7aa"
        : bldg.type === "government"
        ? "#cbd5e1"
        : "#f1f5f9";

    const roofPolygon = L.polygon(roofCoords, {
      color: "#334155",
      weight: 1.2,
      fillColor: roofFill,
      fillOpacity: is3DMode ? 0.96 : 0.85,
    });

    roofPolygon.bindTooltip(
      `<div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
        <strong style="color: #0f172a; display: block; font-size: 12px;">${bldg.name}</strong>
        <span style="color: #0d9488; font-weight: 600;">3D Structure &bull; ${bldg.heightMeters}m Height</span>
        ${bldg.details ? `<p style="margin: 3px 0 0; color: #475569; font-size: 10px;">${bldg.details}</p>` : ""}
      </div>`,
      { sticky: true }
    );

    layerGroup.addLayer(roofPolygon);
  });
}
