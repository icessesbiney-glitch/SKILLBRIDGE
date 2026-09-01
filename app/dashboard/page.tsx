'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import SkillBridgeTaskDashboard from '@/components/SkillBridgeTaskDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        router.push('/auth');
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Secure boundary: Kick unauthenticated guests back to the auth portal
        router.push('/auth');
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    if (!supabase) {
      router.push('/auth');
      return;
    }
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading your profile setup...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">SKILLBRIDGE Workspace</h1>
            <button
              onClick={handleSignOut}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Authenticated Profile Access Email: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.email}</span>
          </p>
          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300">
              Your authentication system is fully operational. Next, we can connect user profiles to a custom SQL database schema table.
            </p>
          </div>
          <SkillBridgeTaskDashboard studentId={user?.id} studentStatus="Intermediate" />
        </div>
      </main>
    </div>
  );
}
