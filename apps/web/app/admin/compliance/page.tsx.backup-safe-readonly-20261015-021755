"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

type Profile = {
  id: string;
  full_name: string;
  role: string;
  skill_level: string | null;
  account_tier: string | null;
  status: string | null;
  country: string | null;
  created_at: string;
};

export default function AdminComplianceDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchLiveRegistry = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error("Please sign in to access the registry.");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, role, skill_level, account_tier, status, country, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProfiles((data ?? []) as Profile[]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load the live account registry."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLiveRegistry();
  }, [fetchLiveRegistry]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Account Compliance Registry
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Live account details from the SkillBridge profiles table.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchLiveRegistry()}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh registry"}
          </button>
        </header>

        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This registry is read-only. Verification and suspension actions
          remain disabled until secure server-side administrator authorization
          and the corresponding live database fields are confirmed.
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {errorMessage}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">Registered accounts</h2>
            <span className="text-sm text-gray-500">
              {loading ? "Loading records..." : `${profiles.length} records`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="p-4">Full name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Account tier</th>
                  <th className="p-4">Skill level</th>
                  <th className="p-4">Account status</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Registered</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Loading live registry...
                    </td>
                  </tr>
                ) : errorMessage ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Registry unavailable. Review the error above.
                    </td>
                  </tr>
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No profile records were returned by the database.
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">
                        {profile.full_name || "Unnamed account"}
                      </td>
                      <td className="p-4">
                        {profile.role || "Not set"}
                      </td>
                      <td className="p-4">
                        {profile.account_tier || "Not set"}
                      </td>
                      <td className="p-4">
                        {profile.skill_level || "Not set"}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          {profile.status || "Not set"}
                        </span>
                      </td>
                      <td className="p-4">
                        {profile.country || "Not set"}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {profile.created_at
                          ? new Date(profile.created_at).toLocaleDateString()
                          : "Unknown"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}