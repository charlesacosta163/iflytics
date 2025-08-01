import { useState } from 'react';

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
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
      disabled={loading}
    >
      {loading ? 'Redirecting...' : 'Subscribe to Premium'}
    </button>
  );
}
