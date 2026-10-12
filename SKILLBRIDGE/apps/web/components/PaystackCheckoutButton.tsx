'use client';

import { useState } from 'react';

import { useAuthSession } from '../hooks/useAuthSession';

export default function PaystackCheckoutButton() {
  const { session } = useAuthSession();
  const [amount, setAmount] = useState('400');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const email = session?.user?.email;

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      setMessage('Sign in before funding your wallet.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/paystack-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, email }),
      });
      const result = await response.json();

      if (result.authorization_url) {
        window.location.href = result.authorization_url;
        return;
      }
      setMessage(result.error || 'Could not start the payment.');
    } catch (error) {
      setMessage('Could not reach the payment gateway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="sb-card">
      <span className="sb-status-pill">Paystack</span>
      <h3>Fund your wallet</h3>
      <p>Pay securely with card or mobile money. Your wallet is credited once Paystack confirms the charge.</p>
      <form className="sb-form" onSubmit={handleCheckout} aria-busy={loading}>
        <label className="sb-field">
          <span>Amount (GHS)</span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="sb-button" disabled={loading || !email}>
          {loading ? 'Connecting to Paystack...' : `Pay GHS ${amount || '0'}`}
        </button>
        {message ? <p role="status">{message}</p> : null}
      </form>
    </article>
  );
}
