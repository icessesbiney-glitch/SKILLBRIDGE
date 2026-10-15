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

    if (!session?.access_token || !email) {
      setMessage('Sign in before funding your wallet.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/paystack-init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || 'Could not start the payment.');
        return;
      }

      if (result.authorization_url) {
        window.location.assign(result.authorization_url);
        return;
      }

      setMessage('Paystack did not return a payment link.');
    } catch {
      setMessage('Could not reach the payment gateway. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="sb-card">
      <span className="sb-status-pill">Paystack</span>
      <h3>Fund your wallet</h3>
      <p>
        Pay securely with a supported Paystack payment method. Your wallet
        should be credited only after the server verifies the payment.
      </p>

      <form className="sb-form" onSubmit={handleCheckout} aria-busy={loading}>
        <label className="sb-field">
          <span>Amount (GHS)</span>
          <input
            type="number"
            min="1"
            max="1000000"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </label>

        <button
          type="submit"
          className="sb-button"
          disabled={loading || !session?.access_token || !email}
        >
          {loading ? 'Connecting to Paystack...' : `Pay GHS ${amount || '0'}`}
        </button>

        {message ? <p role="status">{message}</p> : null}
      </form>
    </article>
  );
}
