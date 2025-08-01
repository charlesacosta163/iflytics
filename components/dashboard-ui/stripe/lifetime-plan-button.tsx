'use client';

export function LifetimeButton() {
  const handleClick = async () => {
    const res = await fetch('/api/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ planType: 'lifetime' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <button
      onClick={handleClick}
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
    >
      Buy Lifetime Access
    </button>
  );
}
