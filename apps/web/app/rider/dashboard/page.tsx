import { createClient } from '@supabase/supabase-js';
import RiderMapSurface from '@/components/delivery/RiderMapSurface';
import { redirect } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const metadata = {
  title: 'Rider Operational Console | SkillBridge Workspace',
  description: 'Real-time telemetry and dispatch matching portal context.',
};

export default async function RiderDashboardPage() {
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  // 1. Resolve current active authentication user identity parameters
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Fetch the corresponding relational database profile reference ID
  const { data: profile, error: profileError } = await supabase
    .from('gps_profiles')
    .select('id')
    .eq('user_id', user.id)
    .eq('profile_type', 'rider')
    .single();

  if (profileError || !profile) {
    // If no rider database identity matrix exists yet, pass a fallback temporary UUID context
    return (
      <main className="min-h-screen bg-slate-900 p-8 flex flex-col justify-start items-stretch">
        <RiderMapSurface 
          riderUserId={user.id} 
          riderProfileId={user.id} 
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 p-8 flex flex-col justify-start items-stretch">
      <RiderMapSurface 
        riderUserId={user.id} 
        riderProfileId={profile.id} 
      />
    </main>
  );
}
