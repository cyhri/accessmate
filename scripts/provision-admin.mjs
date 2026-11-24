import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lduljzvcukjttpheecsq.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdWxqenZjdWtqdHRwaGVlY3NxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTUzNDkzMiwiZXhwIjoyMTExMTEwOTMyfQ.yTVGLOVJ-rk7VgnaMMmEEetUG3L6m8-ojFUg5PYZHOo";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function provisionAdmin(email, password, displayName) {
  console.log(`\n--- Provisioning Administrator: ${email} ---`);

  // 1. Check if user already exists in auth.users
  const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  let user = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.log(`User not found in Supabase Auth. Creating new account for ${email}...`);
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: password || "Admin123!",
      email_confirm: true,
      user_metadata: {
        name: displayName || "Platform Administrator",
        full_name: displayName || "Platform Administrator",
      },
      app_metadata: {
        role: "admin",
      },
    });

    if (createError) {
      console.error("Failed to create admin user:", createError.message);
      process.exit(1);
    }

    user = createData.user;
    console.log(`Account created successfully with ID: ${user.id}`);
  } else {
    console.log(`Existing user found with ID: ${user.id}. Updating app_metadata.role to 'admin'...`);
    const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...user.app_metadata,
          role: "admin",
        },
      }
    );

    if (updateError) {
      console.error("Failed to update user role:", updateError.message);
      process.exit(1);
    }

    user = updateData.user;
    console.log(`Updated app_metadata.role successfully!`);
  }

  // Ensure public.profiles record exists
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: displayName || user.user_metadata?.name || "Platform Administrator",
    });

  if (profileError) {
    console.warn("Notice: Profile upsert returned:", profileError.message);
  } else {
    console.log("Synchronized public.profiles record.");
  }

  // Record administrative provisioning event in admin_activity
  await adminClient.from("admin_activity").insert({
    admin_id: user.id,
    action: "PROVISION_ADMIN",
    entity_type: "user",
    entity_id: user.id,
    metadata: { email: user.email, timestamp: new Date().toISOString() },
  });

  console.log(`\nSUCCESS: ${email} is now a provisioned administrator!`);
  console.log(`Role: ${user.app_metadata?.role}`);
}

async function provisionStandardUser(email, password, displayName) {
  console.log(`\n--- Provisioning Standard Member: ${email} ---`);
  const { data: usersData } = await adminClient.auth.admin.listUsers();
  let user = usersData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: password || "User123!",
      email_confirm: true,
      user_metadata: {
        name: displayName || "Standard Member",
      },
      app_metadata: {
        role: "user",
      },
    });

    if (createError) {
      console.error("Failed to create user:", createError.message);
      return;
    }
    user = createData.user;
    console.log(`Created member account: ${user.id}`);
  } else {
    console.log(`Member account already exists: ${user.id}`);
  }

  await adminClient.from("profiles").upsert({
    id: user.id,
    display_name: displayName || "Standard Member",
  });
  console.log(`Member profile synced.`);
}

async function run() {
  const targetEmail = process.argv[2] || "admin@accessmate.org";
  await provisionAdmin(targetEmail, "Admin123!", "System Administrator");
  await provisionStandardUser("user@accessmate.org", "User123!", "Alex Rivera");
  process.exit(0);
}

run();
