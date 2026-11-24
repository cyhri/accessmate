import pg from "pg";
const { Client } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:access1221mate24412@db.lduljzvcukjttpheecsq.supabase.co:5432/postgres";

const INITIAL_VENUES = [
  {
    name: "Berlin Central Station (Hauptbahnhof)",
    category: "transport",
    description: "Multilevel international rail terminal with tactile transit corridors and elevator hubs.",
    address: "Europaplatz 1, 10557 Berlin",
    latitude: 52.5255,
    longitude: 13.3695,
    publication_status: "published",
  },
  {
    name: "City Public Library (Kulturforum)",
    category: "culture",
    description: "Major civic public library with wide automatic doors, elevator access to reading rooms, and accessible restrooms.",
    address: "Matthäikirchplatz 4, 10785 Berlin",
    latitude: 52.5085,
    longitude: 13.3698,
    publication_status: "published",
  },
  {
    name: "Charité University Medical Center",
    category: "healthcare",
    description: "Comprehensive medical center with step-free entrance ramps, automatic hospital doors, and tactile ground paving.",
    address: "Charitéplatz 1, 10117 Berlin",
    latitude: 52.5262,
    longitude: 13.3789,
    publication_status: "published",
  },
  {
    name: "Spreebogenpark Community Pavilion",
    category: "recreation",
    description: "Public waterfront recreational pavilion with level boardwalk paths and accessible visitor facilities.",
    address: "Alt-Moabit 140, 10557 Berlin",
    latitude: 52.5218,
    longitude: 13.3685,
    publication_status: "published",
  },
];

const INITIAL_REPORTS = [
  {
    title: "Elevator Outage — Platform 2 North Concourse",
    description: "Freight & passenger lift out of service for scheduled motor replacement. Step-free access between street and subway level currently blocked on North side. Use South concourse elevator (120m detour).",
    category: "elevator",
    severity: "critical",
    latitude: 52.5255,
    longitude: 13.3695,
    status: "active",
    moderation_status: "verified",
  },
  {
    title: "Sidewalk Scaffolding & Broken Curb Ramp",
    description: "Facade restoration scaffolding narrows pedestrian sidewalk to 70cm. Temporary wooden ramp exceeds 10% incline. Cross at Moltkebrücke pedestrian crossing.",
    category: "construction",
    severity: "warning",
    latitude: 52.5222,
    longitude: 13.3708,
    status: "active",
    moderation_status: "under_review",
  },
  {
    title: "Deep Pavement Ruts & Broken Stone Surface",
    description: "Cobblestone dislocation after heavy transit vehicle delivery. Severe rolling resistance for manual wheelchairs. Bypass using paved asphalt path 30m east.",
    category: "surface",
    severity: "warning",
    latitude: 52.5208,
    longitude: 13.3725,
    status: "active",
    moderation_status: "submitted",
  },
  {
    title: "Automatic Door Opener Restored",
    description: "North civic entrance automatic sliding doors and accessibility push buttons fully repaired and certified.",
    category: "curb_ramp",
    severity: "resolved",
    latitude: 52.5085,
    longitude: 13.3698,
    status: "resolved",
    moderation_status: "resolved",
  },
];

async function seed() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL for seeding...");

    // Seed Venues if empty
    const vCheck = await client.query("SELECT COUNT(*) FROM public.venues");
    if (parseInt(vCheck.rows[0].count, 10) === 0) {
      console.log("Seeding initial venues...");
      for (const v of INITIAL_VENUES) {
        const vRes = await client.query(
          `INSERT INTO public.venues (name, description, category, address, latitude, longitude, publication_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [v.name, v.description, v.category, v.address, v.latitude, v.longitude, v.publication_status]
        );
        const venueId = vRes.rows[0].id;

        // Add a verified building assessment for the transit hub and library
        if (v.name.includes("Central Station")) {
          await client.query(
            `INSERT INTO public.building_assessments (venue_id, assessment_status, assessment_data, audit_notes)
             VALUES ($1, 'verified', $2, $3)`,
            [
              venueId,
              JSON.stringify({
                general: { name: v.name, buildingType: "transit_station", address: v.address, floorsCount: 3, assessmentDate: "2026-11-15" },
                entrance: {
                  stepFreeAccess: { value: true, status: "verified" },
                  rampAvailability: { value: true, status: "verified" },
                  automaticDoors: { value: true, status: "verified" },
                  doorClearWidthCm: { value: 120, status: "verified" },
                },
                internalMovement: {
                  elevatorAvailable: { value: true, status: "verified" },
                  elevatorOperationalStatus: { value: "operational", status: "verified" },
                  allFloorsAccessible: { value: true, status: "verified" },
                },
                restroom: { accessibleRestroomAvailable: { value: true, status: "verified" } },
              }),
              "Audited transit terminal with tactile ground paving and operational elevator hubs.",
            ]
          );
        } else if (v.name.includes("Public Library")) {
          await client.query(
            `INSERT INTO public.building_assessments (venue_id, assessment_status, assessment_data, audit_notes)
             VALUES ($1, 'verified', $2, $3)`,
            [
              venueId,
              JSON.stringify({
                general: { name: v.name, buildingType: "civic_facility", address: v.address, floorsCount: 2, assessmentDate: "2026-11-10" },
                entrance: {
                  stepFreeAccess: { value: true, status: "verified" },
                  rampAvailability: { value: true, status: "verified" },
                  automaticDoors: { value: true, status: "verified" },
                  doorClearWidthCm: { value: 110, status: "verified" },
                },
                internalMovement: {
                  elevatorAvailable: { value: true, status: "verified" },
                  elevatorOperationalStatus: { value: "operational", status: "verified" },
                  allFloorsAccessible: { value: true, status: "verified" },
                },
                restroom: { accessibleRestroomAvailable: { value: true, status: "verified" } },
              }),
              "Civic library building audit with level access and wide doorways.",
            ]
          );
        }
      }
      console.log("Venues & building assessments seeded successfully.");
    } else {
      console.log(`Venues already exist (${vCheck.rows[0].count} records). Skipping venue seed.`);
    }

    // Seed Community Reports if empty
    const rCheck = await client.query("SELECT COUNT(*) FROM public.community_reports");
    if (parseInt(rCheck.rows[0].count, 10) === 0) {
      console.log("Seeding initial community reports...");
      for (const r of INITIAL_REPORTS) {
        await client.query(
          `INSERT INTO public.community_reports (title, description, category, severity, latitude, longitude, status, moderation_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [r.title, r.description, r.category, r.severity, r.latitude, r.longitude, r.status, r.moderation_status]
        );
      }
      console.log("Community reports seeded successfully.");
    } else {
      console.log(`Community reports already exist (${rCheck.rows[0].count} records). Skipping reports seed.`);
    }

    console.log("Database seeding completed.");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.end();
  }
}

seed();
