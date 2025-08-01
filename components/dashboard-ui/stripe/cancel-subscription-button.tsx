'use client';

import { useState } from 'react';

export function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        body: JSON.stringify({ subscriptionId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Subscription scheduled to cancel at the end of your billing period.');
        // Optionally trigger a UI update or re-fetch subscription status
      } else {
        setMessage(`Failed to cancel: ${data.message}`);
      }
    } catch (err: any) {
      setMessage('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleCancel}
        disabled={isLoading}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Cancelling...
          </span>
        ) : (
          'Cancel Subscription'
        )}
      </button>
      {message && (
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
      )}
    </div>
  );
}
