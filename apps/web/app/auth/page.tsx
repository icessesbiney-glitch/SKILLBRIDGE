'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import SiteChrome from '../../components/SiteChrome';
import { supabase } from '../../utils/supabaseClient';

export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'error' | 'success' | null>(null);
  const isSupabaseConfigured = Boolean(supabase);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setFeedbackType(null);

    try {
      if (!supabase) {
        setFeedbackType('error');
        setMessage('Authentication is not configured yet. Connect the public Supabase settings before signing in.');
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          throw error;
        }
        setFeedbackType('success');
        setMessage('Registration started. Check your email to confirm your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Authentication request failed', error);
      setFeedbackType('error');
      setMessage(
        isSignUp
          ? 'We could not create your account right now. Please try again in a moment.'
          : 'Authentication failed. Check your credentials and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteChrome>
      <section className="sb-section">
        <div className="sb-container sb-auth-layout">
          <div className="sb-panel">
            <span className="sb-eyebrow">Access and onboarding</span>
            <h1>{isSignUp ? 'Create a SkillBridge account' : 'Sign in to continue the rebuild'}</h1>
            <p>
              This page now uses the configured Supabase client instead of placeholder success messages, and it clearly reports when the deployment environment is still incomplete.
            </p>
            <div className="sb-notice">
              <strong>{isSupabaseConfigured ? 'Supabase detected' : 'Supabase missing'}</strong>
              <p>
                {isSupabaseConfigured
                  ? 'You can use the form below to sign in or create an account.'
                  : 'Authentication will stay unavailable until the deployment environment is connected to Supabase.'}
              </p>
            </div>
          </div>

          <div className="sb-auth-card">
            <div className="sb-auth-head">
              <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
              <p>{isSignUp ? 'Start building from one shared workspace.' : 'Continue with repository operations.'}</p>
            </div>

            <form className="sb-form" onSubmit={handleAuth} aria-busy={loading}>
              <label className="sb-field">
                <span>Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              <label className="sb-field">
                <span>Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              {message && (
                <div className={`sb-feedback ${feedbackType === 'error' ? 'is-error' : 'is-success'}`}>
                  {message}
                </div>
              )}

              <button type="submit" disabled={loading} className="sb-button" aria-busy={loading}>
                {loading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
              </button>
            </form>

            <p className="sb-switch-copy">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="sb-text-button">
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
