"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "../../../hooks/useAuthSession";

type ComplianceProfile = {
  id: string;
  legal_name: string;
  phone_number: string;
  role_tier: string;
  verification: "pending" | "verified" | "suspended";
  created_at: string;
};

export default function AdminComplianceDashboard() {
  const { isConfigured, isLoading: isAuthLoading, session } = useAuthSession();
  const [profiles, setProfiles] = useState<ComplianceProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isConfigured || !session?.access_token) {
      setError("Sign in with an administrator account to review profiles.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadProfiles = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/compliance", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load profiles.");
        setProfiles(result.profiles ?? []);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load profiles.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadProfiles();
    return () => controller.abort();
  }, [isAuthLoading, isConfigured, session?.access_token]);

  const updateVerification = async (
    profileId: string,
    verification: "verified" | "suspended",
  ) => {
    if (!session?.access_token) {
      setError("Your session has expired. Sign in again to continue.");
      return;
    }

    setUpdatingId(profileId);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/compliance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ profileId, verification }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update profile.");
      setProfiles((current) =>
        current.map((profile) =>
          profile.id === profileId ? result.profile : profile,
        ),
      );
      setNotice(`Profile marked ${verification}.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update profile.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="sb-section">
      <div className="sb-container">
        <header className="sb-section-heading">
          <div>
            <span className="sb-eyebrow">Administrator</span>
            <h1>Profile verification</h1>
          </div>
          <p>Review submitted customer and vendor profiles.</p>
        </header>

        {error ? <p className="sb-feedback is-error" role="alert">{error}</p> : null}
        {notice ? <p className="sb-feedback is-success" role="status">{notice}</p> : null}

        <div className="sb-panel overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-600">
                <th scope="col" className="p-3">Legal name</th>
                <th scope="col" className="p-3">Phone</th>
                <th scope="col" className="p-3">Account type</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-4" role="status">Loading profiles…</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={5} className="p-4">No profiles are awaiting review.</td></tr>
              ) : profiles.map((profile) => (
                <tr key={profile.id} className="border-b">
                  <td className="p-3">{profile.legal_name}</td>
                  <td className="p-3">{profile.phone_number}</td>
                  <td className="p-3">{profile.role_tier.replaceAll("_", " ")}</td>
                  <td className="p-3">{profile.verification}</td>
                  <td className="p-3">
                    {profile.verification === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="sb-button"
                          disabled={updatingId !== null}
                          onClick={() => updateVerification(profile.id, "verified")}
                        >
                          {updatingId === profile.id ? "Saving…" : "Approve"}
                        </button>
                        <button
                          type="button"
                          className="sb-button-secondary"
                          disabled={updatingId !== null}
                          onClick={() => updateVerification(profile.id, "suspended")}
                        >
                          Suspend
                        </button>
                      </div>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
