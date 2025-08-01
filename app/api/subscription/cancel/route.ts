import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';

export async function POST(req: Request) {
  const { subscriptionId } = await req.json();

  try {
    const canceled = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ success: true, canceled });
  } catch (error: any) {
    console.error('Stripe cancel error:', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/* TALKS ONLY TO STRIPE, NOT TO SUPABASE */