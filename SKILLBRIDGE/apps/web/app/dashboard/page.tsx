import React from 'react';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Repository status and deployment readiness</h1>
        <p className="mt-4">Validation runs without suppressing errors.</p>
        <p className="mt-2">Workflow files now match the repository structure.</p>
      </div>
    </main>
  );
}
