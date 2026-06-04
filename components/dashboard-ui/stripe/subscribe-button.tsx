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
      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-full disabled:opacity-50 transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed"
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Get Started'}
    </button>
  );
}
