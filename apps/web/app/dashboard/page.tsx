'use client';

import { useAuthSession } from '../../hooks/useAuthSession';
import TaskWorkspace from '../../components/TaskWorkspace';

export default function DashboardPage() {
  const { isConfigured, isLoading, session } = useAuthSession();

  const signedIn = Boolean(session?.user?.email);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-8 bg-slate-950 p-6 text-white sm:p-8 lg:grid-cols-[1.5fr_0.8fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs font-bold tracking-widest text-teal-200">
                SKILLBRIDGE
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Learner workspace
              </span>
            </div>

            <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Your skills.
              <span className="block text-teal-300">
                Your next opportunity.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Discover practical tasks, build valuable skills, submit your
              work for review, and follow your progress from one organized
              workspace.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#task-workspace"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Explore available tasks
                <span className="ml-2" aria-hidden="true">→</span>
              </a>

              {!signedIn && (
                <a
                  href="/auth"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in or create account
                </a>
              )}
            </div>
          </div>

          <aside className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Account overview
              </p>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-xl font-bold text-slate-950">
                  {signedIn
                    ? (session?.user?.email?.charAt(0).toUpperCase() || 'L')
                    : 'L'}
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">
                    {isLoading
                      ? 'Checking your account'
                      : signedIn
                        ? 'Welcome back'
                        : 'Welcome, learner'}
                  </h2>

                  <p className="mt-1 break-all text-sm leading-6 text-slate-300">
                    {isLoading
                      ? 'Checking your current session...'
                      : signedIn
                        ? session?.user?.email
                        : 'Sign in to access your personal learner workspace.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-300">Account status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isLoading
                    ? 'bg-amber-300/10 text-amber-200'
                    : signedIn
                      ? 'bg-emerald-300/10 text-emerald-200'
                      : 'bg-slate-400/10 text-slate-300'
                }`}>
                  {isLoading
                    ? 'Checking'
                    : signedIn
                      ? 'Signed in'
                      : isConfigured
                        ? 'Sign in required'
                        : 'Setup required'}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-400">
                Account status is based on your current authentication session.
                Earnings and payments must be confirmed by the production
                backend.
              </p>
            </div>
          </aside>
        </div>

        <div className="grid divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <a
            href="/tasks"
            className="group p-5 transition hover:bg-slate-50 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-900">
                Explore tasks
              </span>
              <span className="text-lg text-teal-700 transition group-hover:translate-x-1" aria-hidden="true">→</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review task requirements and find opportunities that match
              your skills.
            </p>
          </a>

          <a
            href="#task-workspace"
            className="group p-5 transition hover:bg-slate-50 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-900">
                Submit your work
              </span>
              <span className="text-lg text-teal-700 transition group-hover:translate-x-1" aria-hidden="true">→</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Open the task workspace to follow instructions and prepare
              your submission.
            </p>
          </a>

          <a
            href="/auth"
            className="group p-5 transition hover:bg-slate-50 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-900">
                Account access
              </span>
              <span className="text-lg text-teal-700 transition group-hover:translate-x-1" aria-hidden="true">→</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Access your account to use features that require authentication.
            </p>
          </a>
        </div>
      </section>

      <section aria-labelledby="workspace-heading" className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
              Opportunities and learning
            </p>
            <h2
              id="workspace-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              Your learning workspace
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Browse task information, open available work, and use the
              existing submission tools below.
            </p>
          </div>

          <a
            href="/tasks"
            className="inline-flex min-h-10 items-center justify-center self-start rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:self-auto"
          >
            Open task marketplace
          </a>
        </div>

        <div
          id="task-workspace"
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5 lg:p-6"
        >
          <TaskWorkspace />
        </div>
      </section>

      <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>SkillBridge · Learn practical skills and build your opportunities.</p>
        <p>Account balances and payment status must come from verified production records.</p>
      </footer>
    </main>
  );
}