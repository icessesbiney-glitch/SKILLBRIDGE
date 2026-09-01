'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Mock user check - replace with actual Supabase logic
        const mockUser = { email: 'user@example.com' };
        setUser(mockUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">SkillBridge Dashboard</h1>
            <div className="flex gap-4">
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={() => router.push('/auth')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">Welcome to your dashboard</h2>
            <p className="mt-2 text-gray-600">Start your learning journey by creating or joining a skill group.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition">
                <h3 className="font-bold text-gray-900">Skill Group {i}</h3>
                <p className="mt-2 text-sm text-gray-600">Learn and grow with others in this community.</p>
                <button className="mt-4 text-blue-600 font-semibold hover:text-blue-700">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
