import React from 'react';
import GhanaCardOnboardingForm from '../components/GhanaCardOnboardingForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          SkillBridge Marketplace Hub
        </h1>
        <p className="text-lg text-gray-600">
          Global multi-category vendor fulfillment network.
        </p>
      </div>

      <div className="w-full">
        {/* Render the cryptographically checked identity validation component form */}
        <GhanaCardOnboardingForm />
      </div>
    </main>
  );
}
