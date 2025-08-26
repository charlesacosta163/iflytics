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

  const base =
    'font-semibold px-4 py-2 rounded flex items-center gap-2 self-start transition-colors';
  const active =
    isPremiumUser
      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
      : 'bg-green-600 hover:bg-green-700 text-white';
  const disabledStyles = 'opacity-60 cursor-not-allowed';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-busy={loading}
      aria-disabled={loading}
      className={`${base} ${active} flex flex-col gap-1 ${loading ? disabledStyles : ''}`}
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
          : 'Buy Lifetime Access'}
      </span>
      <span className="flex gap-1 items-center text-[0.5rem] self-start"><RiPriceTag3Line /> $49.99 forever</span>
    </button>
  );
}
