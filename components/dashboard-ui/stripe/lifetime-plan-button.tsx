'use client';

import { useState } from 'react';
import { RiPriceTag3Line } from 'react-icons/ri';

interface LifetimeButtonProps {
  isPremiumUser?: boolean;
  currentPeriodEnd?: string;
}

export function LifetimeButton({ isPremiumUser, currentPeriodEnd }: LifetimeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return; // prevent double submits
    setLoading(true);
    try {
      const res = await fetch('/api/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ planType: 'lifetime' }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to create checkout session');

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating lifetime checkout:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false); // only re-enable on failure
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-busy={loading}
      aria-disabled={loading}
      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-full transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading && (
        <span
          className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"
          aria-hidden="true"
        />
      )}
      <span>
        {loading
          ? 'Redirecting...'
          : isPremiumUser
          ? 'Upgrade to Lifetime'
          : 'Get Lifetime Access'}
      </span>
    </button>
  );
}
