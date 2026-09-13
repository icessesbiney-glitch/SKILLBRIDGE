'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import SiteChrome from '../../components/SiteChrome';
import { countryOptions, educationLevels } from '../../data/siteContent';
import { useAuthSession } from '../../hooks/useAuthSession';
import { supabase } from '../../utils/supabaseClient';
import { getAuthFeedbackMessage } from './authFeedback';

export const dynamic = 'force-dynamic';

export default function AuthPage() {
  const router = useRouter();
  const { session } = useAuthSession();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('22');
  const [country, setCountry] = useState('Ghana');
  const [visibility, setVisibility] = useState<'local' | 'public'>('local');
  const [educationLevel, setEducationLevel] = useState(educationLevels[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'error' | 'success' | null>(null);
  const isSupabaseConfigured = Boolean(supabase);

  useEffect(() => {
    if (session?.user) {
      router.replace('/dashboard');
    }
  }, [router, session]);

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              age,
              country,
              visibility,
              education_level: educationLevel,
              qualification_access: 'Open to all learners',
            },
          },
        });
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
              <p>{isSignUp ? 'Register from any country, with Ghana prioritised, and learn to earn at every level.' : 'Continue with repository operations.'}</p>
            </div>

            <form className="sb-form" onSubmit={handleAuth} aria-busy={loading}>
              {isSignUp && (
                <>
                  <label className="sb-field">
                    <span>Full name</span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ama Mensah"
                    />
                  </label>

                  <div className="sb-form-grid">
                    <label className="sb-field">
                      <span>Age</span>
                      <input
                        type="number"
                        min="16"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </label>

                    <label className="sb-field">
                      <span>Country</span>
                      <select value={country} onChange={(e) => setCountry(e.target.value)} className="sb-select">
                        {countryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="sb-form-grid">
                    <label className="sb-field">
                      <span>Education or qualification</span>
                      <select
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value)}
                        className="sb-select"
                      >
                        {educationLevels.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="sb-field">
                      <span>Task visibility</span>
                      <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as 'local' | 'public')}
                        className="sb-select"
                      >
                        <option value="local">Local</option>
                        <option value="public">Public</option>
                      </select>
                    </label>
                  </div>
                </>
              )}

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

              <button
                type="submit"
                disabled={loading || !isSupabaseConfigured}
                className="sb-button"
                aria-busy={loading}
              >
                {loading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
              </button>
            </form>

            <p className="sb-switch-copy">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="sb-text-button">
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
            {isSignUp && (
              <p className="sb-helper-copy">
                Registration is open for all education levels, including no formal qualification. Beginner earnings start from ₵80 and can grow past ₵150 as you complete stronger tasks.
              </p>
            )}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
