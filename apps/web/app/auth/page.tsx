'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import SiteChrome from '../../components/SiteChrome';
import { useAuthSession } from '../../hooks/useAuthSession';
import { supabase } from '../../utils/supabaseClient';
import { getAuthFeedbackMessage } from './authFeedback';
import { getSafeNextPath } from './nextPath';

export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const router = useRouter();
  const { session } = useAuthSession();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'error' | 'success' | null>(null);
  const [nextPath, setNextPath] = useState('/dashboard');
  const isSupabaseConfigured = Boolean(supabase);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setNextPath(getSafeNextPath(window.location.search));
    setIsSignUp(new URLSearchParams(window.location.search).get('mode') === 'signup');
  }, []);

  useEffect(() => {
    if (session?.user) {
      router.replace(nextPath);
    }
  }, [nextPath, router, session]);

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
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) {
          throw error;
        }
        setFeedbackType('success');
        setMessage('Registration started. Check your email to confirm your account.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          throw error;
        }
        if (!data.session) {
          throw new Error('Authentication session was not created.');
        }
        router.refresh();
      }
    } catch (error) {
      console.error('Authentication request failed', error);
      setFeedbackType('error');
      setMessage(getAuthFeedbackMessage(error, isSignUp));
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
            <h1>{isSignUp ? 'Create a SkillBridge account' : 'Sign in to SkillBridge'}</h1>
            <p>
              Use your account to manage your wallet and marketplace activity.
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
              <p>{isSignUp ? 'Create an account to get started.' : 'Welcome back. Sign in to continue.'}</p>
            </div>

            <form className="sb-form" onSubmit={handleAuth} aria-busy={loading}>
              <label className="sb-field">
                <span>Email address</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
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
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
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

              <button
                type="submit"
                disabled={loading || !isSupabaseConfigured}
                className="sb-button"
                aria-busy={loading}
              >
                {loading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
              </button>
            </form>

            <div className="sb-auth-foot">
              <button onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }} className="sb-link-btn">
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
