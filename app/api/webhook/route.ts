// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Required for Stripe
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {

    // Checkout
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout completed:', session);
      break;

    // Subscription
    case 'customer.subscription.created':
      const subCreated = event.data.object as Stripe.Subscription;
      console.log('Subscription created:', subCreated);
      break;

    // Subscription Updated
    case 'customer.subscription.updated':
      const subUpdated = event.data.object as Stripe.Subscription;
      console.log('Subscription updated:', subUpdated);
      break;

    // Subscription Deleted
    case 'customer.subscription.deleted':
      const subDeleted = event.data.object as Stripe.Subscription;
      console.log('Subscription deleted:', subDeleted);
      break;

    // Invoice Paid
    case 'invoice.paid':
      const invoicePaid = event.data.object as Stripe.Invoice;
      console.log('Invoice paid:', invoicePaid);
      break;

    // Invoice Payment Failed
    case 'invoice.payment_failed':
      const invoiceFailed = event.data.object as Stripe.Invoice;
      console.log('Invoice failed:', invoiceFailed);
      break;

    // Payment Intent Succeeded
    case 'payment_intent.succeeded':
      const intentSucceeded = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', intentSucceeded);
      break;

    // Payment Intent Failed
    case 'payment_intent.payment_failed':
      const intentFailed = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', intentFailed);
      break;
 
    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse('Event received', { status: 200 });
}
