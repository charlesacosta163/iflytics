// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/webhook-client";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  console.log("🔥 WEBHOOK CALLED!", new Date().toISOString());
  
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("✅ Webhook verified, event type:", event.type);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("💳 Checkout session completed");
      console.log("📋 Session details:");
      console.log("  - Mode:", session.mode);
      console.log("  - Customer:", session.customer);
      console.log("  - Metadata:", JSON.stringify(session.metadata, null, 2));

      if (session.mode === "payment") {
        console.log("🎯 Processing LIFETIME payment");
        
        const insertData = {
          stripe_customer_id: session.customer as string || null,
          stripe_subscription_id: null,
          plan: "lifetime",
          status: "active",
          ifc_user_id: session.metadata?.ifc_user_id,
          current_period_end: null,
          cancel_at: null,
        };
        
        console.log("📝 About to insert:", JSON.stringify(insertData, null, 2));
        
        const { data, error } = await supabaseAdmin
          .from("subscriptions")
          .insert(insertData);

        if (error) {
          console.error("❌ FAILED to insert lifetime subscription:");
          console.error("Error details:", JSON.stringify(error, null, 2));
        } else {
          console.log("✅ SUCCESS! Lifetime subscription inserted:");
          console.log("Inserted data:", JSON.stringify(data, null, 2));
          
          // NEW: Deactivate the old premium subscription
          const { error: deactivateError } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "inactive" })
            .eq("ifc_user_id", session.metadata?.ifc_user_id)
            .eq("plan", "premium")
            .eq("status", "active");
          
          if (deactivateError) {
            console.error("❌ Failed to deactivate old premium subscription:", deactivateError);
          } else {
            console.log("🔄 Successfully deactivated old premium subscription");
          }
        }
      } else if (session.mode === "subscription") {
        console.log("🔄 Processing SUBSCRIPTION payment");
        // Don't insert subscription here - let customer.subscription.created handle it
        console.log("Subscription will be handled by customer.subscription.created event");
      }
      break;

    // Subscription Created
    case "customer.subscription.created":
      const subCreated = event.data.object as Stripe.Subscription;
      // console.log('Subscription created:', subCreated);

      // Check if user already has a subscription
      const { data: existingSubs, error } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("ifc_user_id", subCreated.metadata?.ifc_user_id)
        .eq("status", "active");

      if (error) {
        console.error("Failed to check for existing subscription:", error);
        break;
      }

      if (existingSubs.length > 0) {
        // Cancel the new duplicate subscription
        try {
          await stripe.subscriptions.cancel(subCreated.id);
          console.log(`Cancelled duplicate subscription: ${subCreated.id}`);
        } catch (err) {
          console.error("Failed to cancel duplicate subscription:", err);
        }
      } else {
        // Optional: log or insert the new subscription if needed
        console.log("New valid subscription created:", subCreated.id);
      }

      break;

    // Subscription Updated
    case "customer.subscription.updated":
      const subUpdated = event.data.object as Stripe.Subscription;

      const subscriptionItem = subUpdated.items.data[0];
      const currentPeriodEnd =
        subscriptionItem?.current_period_end ??
        subscriptionItem.current_period_end ??
        0;

      // Extract cancel_at if user cancels subscription
      const cancelAt = subUpdated.cancel_at
        ? new Date(subUpdated.cancel_at * 1000)
        : null;

      const { data: updatedSubscriptionData, error: updatedSubscriptionError } =
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subUpdated.status,
            current_period_end: new Date(currentPeriodEnd * 1000),
            cancel_at: cancelAt,
          })
          .eq("stripe_subscription_id", subUpdated.id);

      if (updatedSubscriptionError) {
        console.error("Error updating subscription:", updatedSubscriptionError);
      } else {
        console.log("Subscription updated:", updatedSubscriptionData);
      }
      break;

    // Subscription Deleted
    case "customer.subscription.deleted":
      const subDeleted = event.data.object as Stripe.Subscription;
      // console.log('Subscription deleted:', subDeleted);

      const { data: deletedSubscriptionData, error: deletedSubscriptionError } =
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "inactive" })
          .eq("stripe_subscription_id", subDeleted.id);

      if (deletedSubscriptionError) {
        console.error("Error deleting subscription:", deletedSubscriptionError);
      } else {
        console.log("Subscription deleted:", deletedSubscriptionData);
      }

      break;

    // Invoice Paid
    case "invoice.paid":
      const invoicePaid = event.data.object as Stripe.Invoice;
      // console.log('Invoice paid:', invoicePaid);
      break;

    // Invoice Payment Failed
    case "invoice.payment_failed":
      const invoiceFailed = event.data.object as Stripe.Invoice;

      if (
        !invoiceFailed.lines.data.length ||
        !invoiceFailed.lines.data[0].subscription
      ) {
        console.warn(
          "Invoice does not contain valid subscription info:",
          invoiceFailed.id
        );
        break;
      }

      const invoiceSubscriptionItem = invoiceFailed.lines.data[0]
        .subscription as string;

      // console.log('Invoice failed:', invoiceFailed);

      const { data: failedSubscriptionData, error: failedSubscriptionError } =
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", invoiceSubscriptionItem);

      if (failedSubscriptionError) {
        console.error(
          "Error updating failed subscription:",
          failedSubscriptionError
        );
      } else {
        console.log(
          "Marked subscription as past_due:",
          invoiceSubscriptionItem
        );
      }
      break;

    // Payment Intent Succeeded
    case "payment_intent.succeeded":
      const intentSucceeded = event.data.object as Stripe.PaymentIntent;
      // console.log('Payment succeeded:', intentSucceeded);
      break;

    // Payment Intent Failed
    case "payment_intent.payment_failed":
      const intentFailed = event.data.object as Stripe.PaymentIntent;
      // console.log('Payment failed:', intentFailed);
      break;

    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse("Event received", { status: 200 });
}
