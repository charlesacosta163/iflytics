'use client';

import { useState } from 'react';
import { RiPriceTag3Line } from 'react-icons/ri';

import { getUser } from '@/lib/supabase/user-actions';

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
        // Monthly plan subscribe
      const res = await fetch('/api/checkout-session', {
        method: 'POST',
        body: JSON.stringify({
            planType: 'monthly'
        }),
        headers: {
            'Content-Type': 'application/json',
        },
      });

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Checkout session failed:', err);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-yellow-500 hover:bg-yellow-600 text-dark font-semibold px-4 py-2 rounded disabled:opacity-50 flex flex-col gap-1"
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Subscribe to Premium'}
      <span className="flex gap-1 items-center text-[0.5rem]"><RiPriceTag3Line /> $1.99/mo</span>
    </button>
  );
}
