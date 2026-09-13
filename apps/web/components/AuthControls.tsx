'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuthSession } from '../hooks/useAuthSession';
import { supabase } from '../utils/supabaseClient';

export default function AuthControls() {
  const router = useRouter();
  const { isConfigured, isLoading, session } = useAuthSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    setIsSigningOut(true);

    try {
      await supabase.auth.signOut();
      router.push('/auth');
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return <p className="sb-session-copy">Checking session…</p>;
  }

  if (!isConfigured) {
    return (
      <div className="sb-session-actions">
        <p className="sb-session-copy">Supabase setup needed</p>
        <Link href="/auth" className="sb-button-secondary">
          Access setup
        </Link>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="sb-session-actions">
        <Link href="/auth" className="sb-button-secondary">
          Sign in
        </Link>
        <Link href="/auth" className="sb-button">
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="sb-session-actions">
      <div className="sb-session-user">
        <span className="sb-session-label">Signed in</span>
        <strong>{session.user.email}</strong>
      </div>
      <Link href="/dashboard" className="sb-button-secondary">
        Dashboard
      </Link>
      <button type="button" onClick={handleSignOut} className="sb-button" disabled={isSigningOut}>
        {isSigningOut ? 'Signing out…' : 'Log out'}
      </button>
    </div>
  );
}
