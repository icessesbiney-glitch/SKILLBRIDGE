const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzcGR4c3NlcHZsc3drd3N3dmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTUxOTIsImV4cCI6MjETA4OTUxOTJ9.example_signature";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simulated route points through Accra (latitude, longitude)
const accraRoute = [
  { latitude: 5.6042, longitude: -0.1706 }, // Near Airport
  { latitude: 5.5921, longitude: -0.1772 }, // Opolo Junction
  { latitude: 5.5804, longitude: -0.1855 }, // Liberation Road
  { latitude: 5.5682, longitude: -0.1941 }, // Near Ridge
  { latitude: 5.5561, longitude: -0.2012 }  // Central Business District
];

async function simulateTracking() {
  console.log("=== STARTING ACCRA DRIVER GPS MOCK STREAM ===");
  
  for (let i = 0; i < accraRoute.length; i++) {
    const coords = accraRoute[i];
    console.log(`[GPS Ping ${i + 1}/${accraRoute.length}] Driver driver-accra-001 Location: Lat ${coords.latitude}, Long ${coords.longitude}`);
    
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
    
    // Throttle iteration steps by 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("=== GPS STREAM COMPLETED ===");
}

simulateTracking();
