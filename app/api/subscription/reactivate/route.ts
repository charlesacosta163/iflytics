// app/api/subscription/reactivate/route.ts
import { stripe } from '@/lib/stripe/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { subscriptionId } = await req.json();

  try {
    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error('Stripe reactivate error:', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
