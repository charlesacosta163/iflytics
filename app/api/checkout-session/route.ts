// app/api/checkout-session/route.ts
import { Stripe } from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription', // or 'payment' for one-time
    line_items: [
      {
        price: 'price_1RqFEdLdueQ2dAfSoNrhrCIA', // Price ID from Stripe dashboard (IFlytics Premium)
        quantity: 1,
      },
    ],
    success_url: 'https://iflytics.vercel.app/dashboard/profile',
    cancel_url: 'https://iflytics.vercel.app/dashboard/profile',
  });

  console.log(session);

  return NextResponse.json({ url: session.url });
}
