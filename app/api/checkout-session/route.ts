// app/api/checkout-session/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';

// Supabase actions
import { getUser } from '@/lib/supabase/user-actions';


export async function POST(req: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.json();
  const planType = body.planType === 'lifetime' ? 'lifetime' : 'monthly';
  
  const userMetadata = user.user_metadata;

  const isLifetime = planType === 'lifetime';

  const session = await stripe.checkout.sessions.create({
    mode: isLifetime ? 'payment' : 'subscription', // payment == lifetime, subscription == monthly
    customer_email: userMetadata.email,
    allow_promotion_codes: true,
    // Metadata on the objects Stripe will create:
    metadata: {
      ifc_user_id: user.id,
      ifc_username: userMetadata.ifcUsername,
      email: userMetadata.email,
      planType: planType,
    },
    line_items: [
      {
        price: isLifetime ? 
        process.env.STRIPE_LIVE_LIFETIME_PLAN_PRICE_ID :  // Lifetime plan price ID
        process.env.STRIPE_LIVE_MONTHLY_PREMIUM_PRICE_ID, // Monthly plan price ID
        quantity: 1,
      },
    ],
    // success_url: `http://127.0.0.1:3000/dashboard/profile?session_id={CHECKOUT_SESSION_ID}`,
    // cancel_url: `http://127.0.0.1:3000/dashboard/profile`,
    success_url: `https://iflytics.app/dashboard/profile?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: 'https://iflytics.app/dashboard/profile',
  });

  // console.log(session);

  return NextResponse.json({ url: session.url });
}

export async function GET(req: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = new URL(req.url).searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    if (session.metadata?.ifc_user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const planType = session.metadata?.planType ?? "unknown";
    const value = (session.amount_total ?? 0) / 100;
    const currency = (session.currency ?? "usd").toUpperCase();

    const itemName =
      planType === "lifetime"
        ? "IFlytics Lifetime"
        : planType === "monthly"
        ? "IFlytics Premium Monthly"
        : "IFlytics Premium";

    return NextResponse.json({
      transaction_id: session.id,
      plan_type: planType,
      value,
      currency,
      items: [
        {
          item_id: planType,
          item_name: itemName,
          price: value,
          quantity: 1,
        },
      ],
    });
  } catch (error) {
    console.error("Failed to retrieve checkout session:", error);
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }
}