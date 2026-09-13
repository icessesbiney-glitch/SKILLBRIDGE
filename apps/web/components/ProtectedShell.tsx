'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthSession } from '../hooks/useAuthSession';

type ProtectedShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function ProtectedShell({ title, description, children }: ProtectedShellProps) {
  const router = useRouter();
  const pathname = usePathname() || '/dashboard';
  const { isConfigured, isLoading, session } = useAuthSession();
  const authHref = `/auth?next=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    if (!isLoading && isConfigured && !session?.user) {
      router.replace('/auth');
    }
  }, [isConfigured, isLoading, router, session]);

  if (isLoading) {
    return (
      <section className="sb-section">
        <div className="sb-container">
          <div className="sb-panel">
            <span className="sb-eyebrow">Checking access</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isConfigured) {
    return (
      <section className="sb-section">
        <div className="sb-container">
          <div className="sb-panel">
            <span className="sb-eyebrow">Setup required</span>
            <h1>{title}</h1>
            <p>Connect Supabase first so account protection works across the protected pages.</p>
            <Link href={authHref} className="sb-button">
              Open access setup
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!session?.user) {
    return (
      <section className="sb-section">
        <div className="sb-container">
          <div className="sb-panel">
            <span className="sb-eyebrow">Sign in required</span>
            <h1>{title}</h1>
            <p>{description}</p>
            <Link href={authHref} className="sb-button">
              Continue to sign in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
