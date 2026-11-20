'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('SkillBridge route error:', error);
  }, [error]);

  return (
    <main className="sb-section">
      <div className="sb-container">
        <div className="sb-panel">
          <h1>Something went wrong</h1>
          <p>We could not load this page. Try again or return to SkillBridge.</p>
          <button type="button" className="sb-button" onClick={reset}>Try again</button>
        </div>
      </div>
    </main>
  );
}
