'use client';

import { useState } from 'react';

export function ReactivateButton({ subscriptionId }: { subscriptionId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReactivate = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        body: JSON.stringify({ subscriptionId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setSuccess(true);
        // Optional: refresh subscription state from server
        window.location.reload();
      } else {
        const { message } = await res.json();
        console.error('Reactivate failed:', message);
      }
    } catch (err) {
      console.error('Reactivate error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReactivate}
      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
      disabled={loading || success}
    >
      {success ? 'Subscription Reactivated' : loading ? 'Reactivating...' : 'Reactivate Subscription'}
    </button>
  );
}
