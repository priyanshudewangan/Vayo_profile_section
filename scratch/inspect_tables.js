const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");

// Parse .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = "";
let supabaseAnonKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      if (key === "NEXT_PUBLIC_SUPABASE_URL" || key === "SUPABASE_URL") {
        supabaseUrl = val;
      }
      if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY" || key === "SUPABASE_ANON_KEY") {
        supabaseAnonKey = val;
      }
    }
  }
}

// Parse Python backend .env
const pythonEnvPath = path.resolve(__dirname, "../VAYO-version-0/.env");
let pgConfig = {
  host: "localhost",
  port: 5432,
  user: "chata",
  password: "",
  database: "community_matching"
};

if (fs.existsSync(pythonEnvPath)) {
  const content = fs.readFileSync(pythonEnvPath, "utf8");
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      if (key === "POSTGRES_HOST") pgConfig.host = val;
      if (key === "POSTGRES_PORT") pgConfig.port = parseInt(val) || 5432;
      if (key === "POSTGRES_USER") pgConfig.user = val;
      if (key === "POSTGRES_PASSWORD") pgConfig.password = val;
      if (key === "POSTGRES_DB") pgConfig.database = val;
    }
  }
}

async function checkLocalPostgres() {
  console.log("\n--- Checking Local Postgres ---");
  const client = new Client(pgConfig);
  try {
    await client.connect();
    console.log("Connected to local Postgres database:", pgConfig.database);

    // List all tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Local Tables:", tablesRes.rows.map(r => r.table_name));

    // Get columns of events
    try {
      const columnsRes = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'events'
      `);
      console.log("Local 'events' columns:", columnsRes.rows.map(r => `${r.column_name} (${r.data_type})`));
    } catch (e) {
      console.error("Error inspecting local 'events' table:", e.message);
    }
  } catch (err) {
    console.error("Could not connect to local Postgres:", err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch all rsvps
  const { data: rsvps, error: rsvpError } = await supabase
    .from("rsvps")
    .select("*");

  if (rsvpError) {
    console.error("Error fetching rsvps from Supabase:", rsvpError.message);
  } else {
    console.log("All Supabase RSVPs:", rsvps);
  }
}

main().catch(console.error);


main().catch(console.error);
