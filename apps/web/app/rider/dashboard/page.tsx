import RiderMapSurface from "@/components/delivery/RiderMapSurface";
import { createClient as createSupabaseServerClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Rider Operational Console | SkillBridge Workspace",
  description: "Real-time telemetry and dispatch matching portal context.",
};

export default async function RiderDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth");
  }

  const { data: profile, error: profileError } = await supabase
    .from("gps_profiles")
    .select("id")
    .eq("user_id", user.id)
    .eq("profile_type", "rider")
    .maybeSingle();

  if (profileError) {
    console.error("Unable to load rider profile:", profileError);
  }

  return (
    <main className="min-h-screen bg-slate-900 p-8 flex flex-col justify-start items-stretch">
      <RiderMapSurface
        riderUserId={user.id}
        riderProfileId={profile?.id ?? user.id}
      />
    </main>
  );
}
