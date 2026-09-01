import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">SkillBridge</h1>
        <p className="mb-8 text-xl text-gray-600">Build momentum together</p>
        <p className="mb-8 max-w-2xl text-gray-700">
          A focused workspace for learning, sharing, and growing skills together.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth"
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
