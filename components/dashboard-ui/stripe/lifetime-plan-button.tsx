'use client';

interface LifetimeButtonProps {
  isPremiumUser?: boolean;
  currentPeriodEnd?: string;
}

export function LifetimeButton({ isPremiumUser, currentPeriodEnd }: LifetimeButtonProps) {
  const handleClick = async () => {
    try {
      const res = await fetch('/api/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ planType: 'lifetime' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating lifetime checkout:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`font-semibold px-4 py-2 rounded flex items-center gap-2 ${
        isPremiumUser 
          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white'
          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
      }`}
    >
      {isPremiumUser ? (
        <>
          <span>Upgrade to Lifetime</span>
          {/* <span className="text-xs bg-yellow-700 px-2 py-0.5 rounded-full">
            Special Price
          </span> */}
        </>
      ) : (
        'Buy Lifetime Access'
      )}
    </button>
  );
}
