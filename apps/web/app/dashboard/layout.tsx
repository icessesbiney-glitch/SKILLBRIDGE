import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl p-4">
        {children}
      </div>
    </section>
  );
}
