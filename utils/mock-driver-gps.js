const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://lSpdxSSepvlSwkwSvel.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcGR4c3NlcHZsc3drd3N3dmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTUxOTIsImV4cCI6MjETA4OTUxOTJ9.example_signature";

// Configure cross-platform native fetch overrides to enable clean outbound client transactions
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    headers: {
      "Content-Type": "application/json",
      "X-Client-Info": "skillbridge-mock-driver-gps"
    }
  }
});

const accraRoute = [
  { latitude: 5.6042, longitude: -0.1706 },
  { latitude: 5.5921, longitude: -0.1772 },
  { latitude: 5.5804, longitude: -0.1855 },
  { latitude: 5.5682, longitude: -0.1941 },
  { latitude: 5.5561, longitude: -0.2012 }
];

async function simulateTracking() {
  console.log("=== STARTING ACCRA DRIVER GPS MOCK STREAM ===");
  
  for (let i = 0; i < accraRoute.length; i++) {
    const coords = accraRoute[i];
    console.log(`[GPS Ping ${i + 1}/${accraRoute.length}] Target: Lat ${coords.latitude}, Long ${coords.longitude}`);
    
    const { error } = await supabase
      .from("driver_locations")
      .upsert({
        driver_id: "driver-accra-001",
        latitude: coords.latitude,
        longitude: coords.longitude,
        updated_at: new Date().toISOString()
      }, { onConflict: "driver_id" });

    if (error) {
      console.error("❌ Live streaming insert failed:", error.message);
    } else {
      console.log("✅ Coordinates successfully synchronized with Supabase platform ledger.");
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log("=== GPS STREAM COMPLETED ===");
}

simulateTracking();