import AdminGPSDashboard from '@/components/admin/AdminGPSDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GPS Surveillance Matrix | SkillBridge Admin',
  description: 'Real-time telemetry tracking monitoring controls console workspace panel.',
};

export default function AdminGPSPage() {
  return (
    <main className="min-h-screen bg-slate-900 p-8 flex flex-col justify-start items-stretch">
      <div className="max-w-7xl mx-auto w-full">
        <AdminGPSDashboard />
      </div>
    </main>
  );
}
