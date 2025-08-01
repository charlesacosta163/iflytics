// app/api/checkout-session/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';

// Supabase actions
import { getUser } from '@/lib/supabase/user-actions';


export async function POST(req: Request) {
  const body = await req.json();
  const planType = body.planType === 'lifetime' ? 'lifetime' : 'monthly';
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  const userMetadata = user.user_metadata;

  const isLifetime = planType === 'lifetime';

  const session = await stripe.checkout.sessions.create({
    mode: isLifetime ? 'payment' : 'subscription', // payment == lifetime, subscription == monthly
    customer_email: userMetadata.email,
    allow_promotion_codes: true,
    metadata: {
        ifc_user_id: user.id, // auth user id
        ifc_username: userMetadata.ifcUsername, // if username
        email: userMetadata.email, // email
    },
    line_items: [
      {
        price: isLifetime ? 
            process.env.STRIPE_LIFETIME_PLAN_PRICE_ID :  // Lifetime plan price ID
            process.env.STRIPE_MONTHLY_PREMIUM_PRICE_ID, // Monthly plan price ID
        quantity: 1,
      },
    ],
    success_url: 'https://iflytics.vercel.app/dashboard/profile',
    cancel_url: 'https://iflytics.vercel.app/dashboard/profile',
  });

  console.log(session);

  return NextResponse.json({ url: session.url });
}
