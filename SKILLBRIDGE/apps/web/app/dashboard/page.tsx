import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto p-4">
        {children}
      </div>
    </section>
  );
}