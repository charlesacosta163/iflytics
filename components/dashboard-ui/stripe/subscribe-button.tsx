'use client';

export function SubscribeButton() {
  const handleClick = async () => {
    const res = await fetch('/api/checkout-session', {
      method: 'POST',
    });

    const { url } = await res.json();
    window.location.href = url; // Redirect to Stripe Checkout
  };

  return (
    <button
      onClick={handleClick}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded"
    >
      Subscribe to Premium
    </button>
  );
}
