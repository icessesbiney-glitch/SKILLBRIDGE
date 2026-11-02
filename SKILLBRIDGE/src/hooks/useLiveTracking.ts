import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize the client container using system configuration contexts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TelemetryRecord {
  rider_id: string;
  full_name: string | null;
  status: string;
  live_longitude: number;
  live_latitude: number;
  battery_percentage: number;
  updated_at: string;
}

export const useLiveTracking = () => {
  const [riders, setRiders] = useState<Record<string, TelemetryRecord>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Retrieve the initial spatial positioning map baseline state from the database view
    const fetchBaseline = async () => {
      const { data, error } = await supabase
        .from('vw_admin_live_telemetry')
        .select('*');

      if (!error && data) {
        const initialMap = data.reduce((acc, curr) => {
          acc[curr.rider_id] = curr;
          return acc;
        }, {} as Record<string, TelemetryRecord>);
        setRiders(initialMap);
      }
      setLoading(false);
    };

    fetchBaseline();

    // 2. Open a real-time event pipeline stream directly over the admin tracking database cluster
    const telemetryChannel = supabase
      .channel('admin-gps-live-ticks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_gps_tracking' },
        async (payload) => {
          const newTick = payload.new as any;
          
          if (newTick && newTick.rider_id) {
            // Fetch rider profile information from local memory cache state if empty
            let fullName = riders[newTick.rider_id]?.full_name || null;
            
            if (!fullName) {
              const { data } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', newTick.rider_id)
                .single();
              if (data) fullName = data.full_name;
            }

            setRiders((prev) => ({
              ...prev,
              [newTick.rider_id]: {
                rider_id: newTick.rider_id,
                full_name: fullName,
                status: newTick.status,
                live_longitude: newTick.live_longitude,
                live_latitude: newTick.live_latitude,
                battery_percentage: newTick.battery_percentage,
                updated_at: newTick.updated_at || new Date().toISOString(),
              },
            }));
          }
        }
      )
      .subscribe();

    // 3. Clean up and close down open socket channels during unmount lifecycle states
    return () => {
      supabase.removeChannel(telemetryChannel);
    };
  }, [riders]);

  return { riders: Object.values(riders), loading };
};
