'use client';

import Link from 'next/link';

import { useAuthSession } from '../hooks/useAuthSession';

export default function AuthStatusCard() {
  const { isConfigured, isLoading, session } = useAuthSession();

  let title = 'Authentication is still being checked.';
  let detail = 'The app is loading your current session.';
  let actionLabel = 'Open access page';

  if (!isLoading && !isConfigured) {
    title = 'Authentication is not configured yet.';
    detail = 'Add the public Supabase URL and anon key before turning on live sign-in and account creation.';
  } else if (!isLoading && isConfigured && !session?.user) {
    title = 'You are currently signed out.';
    detail = 'Create an account or sign in to manage roadmap progress, deployment operations, and team updates.';
  } else if (!isLoading && session?.user) {
    title = `Signed in as ${session.user.email}`;
    detail = 'You can continue with dashboard work, roadmap tracking, and sign out at any time from the top navigation.';
    actionLabel = 'Open account access';
  }

  return (
    <article className="sb-card">
      <span className="sb-status-pill">{session?.user ? 'Account active' : isConfigured ? 'Signed out' : 'Setup required'}</span>
      <h3>{title}</h3>
      <p>{detail}</p>
      <Link href="/auth" className="sb-button-secondary">
        {actionLabel}
      </Link>
    </article>
  );
}
